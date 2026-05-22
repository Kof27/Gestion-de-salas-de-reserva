"use client";

import { useCallback, useMemo, useState } from "react";
import { getReservas } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";
import { getUsuarios } from "@/src/shared/api/getUsuario";
import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";
import type { usuario } from "@/src/entities/usuario";

export interface UsuarioListItem {
  id_usuario: number;
  nombre: string;
  correo: string;
  totalReservas: number;
  reservasRealizadas: number;
  reservasCanceladas: number;
}

export interface ReservaDetalle {
  id_reserva: string | number;
  salaNombre: string;
  salaUbicacion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: "realizada" | "cancelada";
  motivo: string;
}

export interface UsuarioDetalle {
  id_usuario: number;
  nombre: string;
  correo: string;
  totalReservas: number;
  reservasRealizadas: number;
  reservasCanceladas: number;
  reservas: ReservaDetalle[];
  estadoChart: { name: string; value: number; color: string }[];
  salasChart: { salaNombre: string; total: number }[];
  diaSemanaChart: { dia: string; total: number }[];
  mesChart: { mes: string; realizadas: number; canceladas: number }[];
}

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function useReporteUsuarios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allReservas, setAllReservas] = useState<reserva[]>([]);
  const [allSalas, setAllSalas] = useState<Sala[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<usuario[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservasData, roomsData, usuariosData] = await Promise.all([
        getReservas(),
        getRooms(),
        getUsuarios(),
      ]);

      setAllReservas(reservasData);
      setAllSalas(roomsData);
      setAllUsuarios(usuariosData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudieron cargar los datos del reporte");
    } finally {
      setLoading(false);
    }
  }, []);

  const usuarioFacultad = useMemo(() => {
    if (typeof window === "undefined") return null;
    const usuarioRaw = localStorage.getItem("usuario");
    if (!usuarioRaw) return null;
    try {
      return Number((JSON.parse(usuarioRaw) as { id_facultad: number }).id_facultad);
    } catch {
      return null;
    }
  }, []);

  // Usuarios de la facultad
  const usuariosFacultad = useMemo(() => {
    if (!usuarioFacultad) return allUsuarios;
    return allUsuarios.filter((u) => Number(u.id_facultad) === usuarioFacultad);
  }, [allUsuarios, usuarioFacultad]);

  // Lista de usuarios con contadores
  const userList = useMemo((): UsuarioListItem[] => {
    return usuariosFacultad
      .map((u) => {
        const reservasUsuario = allReservas.filter(
          (r) => Number(r.id_usuario) === Number(u.id_usuario)
        );
        const realizadas = reservasUsuario.filter((r) => Boolean(r.estado)).length;
        const canceladas = reservasUsuario.filter((r) => !r.estado).length;

        return {
          id_usuario: Number(u.id_usuario),
          nombre: u.nombre,
          correo: u.correo,
          totalReservas: reservasUsuario.length,
          reservasRealizadas: realizadas,
          reservasCanceladas: canceladas,
        };
      })
      .sort((a, b) => b.totalReservas - a.totalReservas);
  }, [usuariosFacultad, allReservas]);

  // Lista filtrada por búsqueda
  const filteredUserList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return userList;
    return userList.filter(
      (u) =>
        u.nombre.toLowerCase().includes(query) ||
        u.correo.toLowerCase().includes(query)
    );
  }, [userList, searchQuery]);

  // Detalle del usuario seleccionado
  const selectedUserDetail = useMemo((): UsuarioDetalle | null => {
    if (selectedUserId === null) return null;

    const user = usuariosFacultad.find(
      (u) => Number(u.id_usuario) === selectedUserId
    );
    if (!user) return null;

    const reservasUsuario = allReservas
      .filter((r) => Number(r.id_usuario) === selectedUserId)
      .sort(
        (a, b) =>
          new Date(b.hora_inicio).getTime() - new Date(a.hora_inicio).getTime()
      );

    const reservas: ReservaDetalle[] = reservasUsuario.map((r) => {
      const sala = allSalas.find((s) => Number(s.id_sala) === Number(r.id_sala));
      const startDate = new Date(r.hora_inicio);
      const endDate = new Date(r.hora_fin);

      return {
        id_reserva: r.id_reserva,
        salaNombre: sala?.nombre ?? `Sala ${r.id_sala}`,
        salaUbicacion: sala?.ubicacion ?? "—",
        fecha: startDate.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        horaInicio: startDate.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        horaFin: endDate.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        estado: r.estado ? "realizada" : "cancelada",
        motivo: r.motivo,
      };
    });

    const realizadas = reservas.filter((r) => r.estado === "realizada").length;
    const canceladas = reservas.filter((r) => r.estado === "cancelada").length;

    // Estado: realizadas vs canceladas
    const estadoChart = [
      { name: "Realizadas", value: realizadas, color: "#22c55e" },
      { name: "Canceladas", value: canceladas, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    // Top 5 salas más reservadas por este usuario
    const salaCountMap = new Map<string, number>();
    reservasUsuario.forEach((r) => {
      const sala = allSalas.find((s) => Number(s.id_sala) === Number(r.id_sala));
      const nombre = sala?.nombre ?? `Sala ${r.id_sala}`;
      salaCountMap.set(nombre, (salaCountMap.get(nombre) ?? 0) + 1);
    });
    const salasChart = Array.from(salaCountMap.entries())
      .map(([salaNombre, total]) => ({ salaNombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Reservas por día de la semana
    const diaSemanaCounts = new Array(7).fill(0);
    reservasUsuario.forEach((r) => {
      const date = new Date(r.hora_inicio);
      diaSemanaCounts[date.getDay()]++;
    });
    const diaSemanaChart = DIAS_SEMANA.map((dia, idx) => ({
      dia: dia.slice(0, 3),
      total: diaSemanaCounts[idx],
    }));

    // Reservas por mes (realizadas vs canceladas)
    const mesMap = new Map<string, { realizadas: number; canceladas: number }>();
    reservasUsuario.forEach((r) => {
      const date = new Date(r.hora_inicio);
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      const current = mesMap.get(key) ?? { realizadas: 0, canceladas: 0 };
      if (r.estado) {
        current.realizadas++;
      } else {
        current.canceladas++;
      }
      mesMap.set(key, current);
    });
    const mesChart = Array.from(mesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        return {
          mes: `${MESES[Number(month)]} ${year.slice(2)}`,
          realizadas: value.realizadas,
          canceladas: value.canceladas,
        };
      });

    return {
      id_usuario: Number(user.id_usuario),
      nombre: user.nombre,
      correo: user.correo,
      totalReservas: reservas.length,
      reservasRealizadas: realizadas,
      reservasCanceladas: canceladas,
      reservas,
      estadoChart,
      salasChart,
      diaSemanaChart,
      mesChart,
    };
  }, [selectedUserId, usuariosFacultad, allReservas, allSalas]);

  const selectUser = useCallback((id: number) => {
    setSelectedUserId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUserId(null);
  }, []);

  return {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    userList,
    filteredUserList,
    selectedUserDetail,
    selectUser,
    clearSelection,
    loadData,
  };
}
