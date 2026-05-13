"use client";

import { useCallback, useMemo, useState } from "react";
import { getReservas } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";
import type { reserva } from "@/src/entities/reserva";
import type { Sala } from "@/src/entities/room";

interface TimelineData {
  date: string;
  [key: string]: string | number;
}

interface ValidationError {
  startDate?: string;
  endDate?: string;
  range?: string;
}

function getDefaultStartDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDefaultEndDate(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function calculateHoursFromReserva(r: reserva): number {
  const start = new Date(r.hora_inicio).getTime();
  const end = new Date(r.hora_fin).getTime();
  return Math.max(0, (end - start) / (1000 * 60 * 60));
}

export function useReporteHoras() {
  const [pendingStartDate, setPendingStartDate] = useState<string>(
    getDefaultStartDate().toISOString().split("T")[0]
  );
  const [pendingEndDate, setPendingEndDate] = useState<string>(
    getDefaultEndDate().toISOString().split("T")[0]
  );

  const [appliedStartDate, setAppliedStartDate] = useState<Date>(getDefaultStartDate());
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(getDefaultEndDate());

  const [validationError, setValidationError] = useState<ValidationError>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allReservas, setAllReservas] = useState<reserva[]>([]);
  const [allSalas, setAllSalas] = useState<Sala[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservasData, roomsData] = await Promise.all([
        getReservas(),
        getRooms(),
      ]);

      setAllReservas(reservasData);
      setAllSalas(roomsData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudieron cargar los datos del reporte");
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilter = useCallback(() => {
    const errors: ValidationError = {};

    if (!pendingStartDate) {
      errors.startDate = "La fecha de inicio es obligatoria";
    }
    if (!pendingEndDate) {
      errors.endDate = "La fecha de fin es obligatoria";
    }

    if (pendingStartDate && pendingEndDate) {
      const start = new Date(pendingStartDate);
      const end = new Date(pendingEndDate);
      if (start > end) {
        errors.range = "La fecha de inicio no puede ser posterior a la fecha de fin";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return false;
    }

    const startDate = new Date(pendingStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(pendingEndDate);
    endDate.setHours(23, 59, 59, 999);

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setValidationError({});
    return true;
  }, [pendingStartDate, pendingEndDate]);

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

  const filteredReservas = useMemo(() => {
    return allReservas.filter((r) => {
      const reservaDate = new Date(r.hora_inicio);
      const isInDateRange =
        reservaDate >= appliedStartDate && reservaDate <= appliedEndDate;

      const sala = allSalas.find((s) => Number(s.id_sala) === Number(r.id_sala));
      const isSalaFromFacultad = !usuarioFacultad || sala?.id_facultad === usuarioFacultad;

      return isInDateRange && isSalaFromFacultad && r.estado !== "cancelada";
    });
  }, [allReservas, allSalas, appliedStartDate, appliedEndDate, usuarioFacultad]);

  // Agrupar horas por sala
  const reportData = useMemo(() => {
    const salaMap = new Map<number, { nombre: string; horas: number; reservas: number }>();

    filteredReservas.forEach((r) => {
      const salaId = Number(r.id_sala);
      const sala = allSalas.find((s) => Number(s.id_sala) === salaId);
      if (!sala) return;

      const horas = calculateHoursFromReserva(r);

      if (salaMap.has(salaId)) {
        const current = salaMap.get(salaId)!;
        salaMap.set(salaId, {
          nombre: current.nombre,
          horas: current.horas + horas,
          reservas: current.reservas + 1,
        });
      } else {
        salaMap.set(salaId, { nombre: sala.nombre, horas, reservas: 1 });
      }
    });

    const totalHoras = Array.from(salaMap.values()).reduce((acc, v) => acc + v.horas, 0);

    return Array.from(salaMap.entries())
      .map(([salaId, data]) => ({
        salaId,
        salaNombre: data.nombre,
        totalHoras: Math.round(data.horas * 10) / 10,
        totalReservas: data.reservas,
        promedioPorReserva: data.reservas > 0 ? Math.round((data.horas / data.reservas) * 10) / 10 : 0,
        percentage: totalHoras > 0 ? Math.round((data.horas / totalHoras) * 100) : 0,
      }))
      .sort((a, b) => b.totalHoras - a.totalHoras);
  }, [filteredReservas, allSalas]);

  // Evolución temporal: horas por día y por sala
  const timelineData = useMemo((): TimelineData[] => {
    const salaNombres = new Set<string>();
    filteredReservas.forEach((r) => {
      const sala = allSalas.find((s) => Number(s.id_sala) === Number(r.id_sala));
      if (sala) salaNombres.add(sala.nombre);
    });

    const dayMap = new Map<string, Map<string, number>>();
    const current = new Date(appliedStartDate);
    while (current <= appliedEndDate) {
      const key = current.toISOString().split("T")[0];
      const salaCounts = new Map<string, number>();
      salaNombres.forEach((nombre) => salaCounts.set(nombre, 0));
      dayMap.set(key, salaCounts);
      current.setDate(current.getDate() + 1);
    }

    filteredReservas.forEach((r) => {
      const sala = allSalas.find((s) => Number(s.id_sala) === Number(r.id_sala));
      if (!sala) return;
      const dayKey = new Date(r.hora_inicio).toISOString().split("T")[0];
      const dayData = dayMap.get(dayKey);
      if (dayData) {
        const horas = calculateHoursFromReserva(r);
        dayData.set(sala.nombre, (dayData.get(sala.nombre) ?? 0) + horas);
      }
    });

    return Array.from(dayMap.entries()).map(([date, salaCounts]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
      });
      const row: TimelineData = { date: label };
      salaCounts.forEach((count, nombre) => {
        row[nombre] = Math.round(count * 10) / 10;
      });
      return row;
    });
  }, [filteredReservas, appliedStartDate, appliedEndDate, allSalas]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalHoras = reportData.reduce((acc, v) => acc + v.totalHoras, 0);
    const totalReservas = filteredReservas.length;
    const totalSalas = reportData.length;

    let salaConMasHoras: string | null = null;
    let maxHoras = 0;

    reportData.forEach((item) => {
      if (item.totalHoras > maxHoras) {
        maxHoras = item.totalHoras;
        salaConMasHoras = item.salaNombre;
      }
    });

    const promedioPorReserva =
      totalReservas > 0 ? Math.round((totalHoras / totalReservas) * 10) / 10 : 0;

    const daysInRange =
      Math.ceil((appliedEndDate.getTime() - appliedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const promedioDiario = daysInRange > 0 ? Math.round((totalHoras / daysInRange) * 10) / 10 : 0;

    return {
      totalHoras: Math.round(totalHoras * 10) / 10,
      totalSalas,
      salaConMasHoras,
      maxHoras,
      promedioPorReserva,
      promedioDiario,
      daysInRange,
    };
  }, [reportData, filteredReservas, appliedStartDate, appliedEndDate]);

  return {
    loading,
    error,
    pendingStartDate,
    setPendingStartDate,
    pendingEndDate,
    setPendingEndDate,
    appliedStartDate,
    appliedEndDate,
    validationError,
    applyFilter,
    reportData,
    timelineData,
    stats,
    loadData,
  };
}
