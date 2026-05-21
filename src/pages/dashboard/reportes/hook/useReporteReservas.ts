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
  reservationCount?: string;
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

export function useReporteReservas() {
  const [pendingStartDate, setPendingStartDate] = useState<string>(
    getDefaultStartDate().toISOString().split("T")[0]
  );
  const [pendingEndDate, setPendingEndDate] = useState<string>(
    getDefaultEndDate().toISOString().split("T")[0]
  );

  const [pendingReservationCount, setPendingReservationCountState] =
    useState<string>("");
  const [appliedReservationCount, setAppliedReservationCount] =
    useState<string>("");

  const [appliedStartDate, setAppliedStartDate] = useState<Date>(
    getDefaultStartDate()
  );
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(
    getDefaultEndDate()
  );

  const [validationError, setValidationError] = useState<ValidationError>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allReservas, setAllReservas] = useState<reserva[]>([]);
  const [allSalas, setAllSalas] = useState<Sala[]>([]);

  const setPendingReservationCount = useCallback((value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    setPendingReservationCountState(onlyNumbers);
  }, []);

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
        errors.range =
          "La fecha de inicio no puede ser posterior a la fecha de fin";
      }
    }

    if (
      pendingReservationCount !== "" &&
      !/^\d+$/.test(pendingReservationCount)
    ) {
      errors.reservationCount =
        "El número de reservas solo puede contener números";
    }

    if (
      pendingReservationCount !== "" &&
      Number(pendingReservationCount) < 1
    ) {
      errors.reservationCount =
        "El número de reservas debe ser mayor o igual a 1";
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
    setAppliedReservationCount(pendingReservationCount);
    setValidationError({});

    return true;
  }, [pendingStartDate, pendingEndDate, pendingReservationCount]);

  const usuarioFacultad = useMemo(() => {
    if (typeof window === "undefined") return null;

    const usuarioRaw = localStorage.getItem("usuario");
    if (!usuarioRaw) return null;

    try {
      return Number(
        (JSON.parse(usuarioRaw) as { id_facultad: number }).id_facultad
      );
    } catch {
      return null;
    }
  }, []);

  const salasDeLaFacultad = useMemo(() => {
    return allSalas.filter((sala) => {
      return !usuarioFacultad || sala.id_facultad === usuarioFacultad;
    });
  }, [allSalas, usuarioFacultad]);

  const filteredReservas = useMemo(() => {
    return allReservas.filter((r) => {
      const reservaDate = new Date(r.hora_inicio);

      const isInDateRange =
        reservaDate >= appliedStartDate && reservaDate <= appliedEndDate;

      const sala = allSalas.find(
        (s) => Number(s.id_sala) === Number(r.id_sala)
      );

      const isSalaFromFacultad =
        !usuarioFacultad || sala?.id_facultad === usuarioFacultad;

      return isInDateRange && isSalaFromFacultad && r.estado !== false;
    });
  }, [
    allReservas,
    allSalas,
    appliedStartDate,
    appliedEndDate,
    usuarioFacultad,
  ]);

  const reportData = useMemo(() => {
    const countBySala = new Map<number, number>();

    filteredReservas.forEach((r) => {
      const salaId = Number(r.id_sala);
      countBySala.set(salaId, (countBySala.get(salaId) ?? 0) + 1);
    });

    const shouldFilterByReservationCount = appliedReservationCount !== "";
    const reservationCountToFilter = shouldFilterByReservationCount
      ? Number(appliedReservationCount)
      : null;

    const baseSalas = shouldFilterByReservationCount
      ? salasDeLaFacultad
      : salasDeLaFacultad.filter((sala) =>
        countBySala.has(Number(sala.id_sala))
      );

    const groupedData = baseSalas.map((sala) => {
      const salaId = Number(sala.id_sala);
      const totalReservas = countBySala.get(salaId) ?? 0;

      return {
        salaId,
        salaNombre: sala.nombre,
        totalReservas,
      };
    });

    const filteredByReservationCount = shouldFilterByReservationCount
      ? groupedData.filter(
        (item) => item.totalReservas === reservationCountToFilter
      )
      : groupedData;

    const totalVisibleReservas = filteredByReservationCount.reduce(
      (acc, item) => acc + item.totalReservas,
      0
    );

    return filteredByReservationCount
      .map((item) => ({
        ...item,
        percentage:
          totalVisibleReservas > 0
            ? Math.round((item.totalReservas / totalVisibleReservas) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalReservas - a.totalReservas);
  }, [
    filteredReservas,
    salasDeLaFacultad,
    appliedReservationCount,
  ]);

  const timelineData = useMemo((): TimelineData[] => {
    const visibleSalaIds = new Set(reportData.map((sala) => sala.salaId));

    const salaNombres = new Map<number, string>();
    reportData.forEach((sala) => {
      salaNombres.set(sala.salaId, sala.salaNombre);
    });

    const dayMap = new Map<string, Map<string, number>>();
    const current = new Date(appliedStartDate);

    while (current <= appliedEndDate) {
      const key = current.toISOString().split("T")[0];
      const salaCounts = new Map<string, number>();

      salaNombres.forEach((nombre) => {
        salaCounts.set(nombre, 0);
      });

      dayMap.set(key, salaCounts);
      current.setDate(current.getDate() + 1);
    }

    filteredReservas.forEach((r) => {
      const salaId = Number(r.id_sala);

      if (!visibleSalaIds.has(salaId)) return;

      const salaNombre = salaNombres.get(salaId);
      if (!salaNombre) return;

      const dayKey = new Date(r.hora_inicio).toISOString().split("T")[0];
      const dayData = dayMap.get(dayKey);

      if (dayData) {
        dayData.set(salaNombre, (dayData.get(salaNombre) ?? 0) + 1);
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
        row[nombre] = count;
      });

      return row;
    });
  }, [
    filteredReservas,
    reportData,
    appliedStartDate,
    appliedEndDate,
  ]);

  const stats = useMemo(() => {
    const totalReservas = reportData.reduce(
      (acc, item) => acc + item.totalReservas,
      0
    );

    const totalSalas = reportData.length;

    let salaConMasReservas: string | null = null;
    let maxReservas = 0;

    reportData.forEach((item) => {
      if (item.totalReservas > maxReservas) {
        maxReservas = item.totalReservas;
        salaConMasReservas = item.salaNombre;
      }
    });

    const daysInRange =
      Math.ceil(
        (appliedEndDate.getTime() - appliedStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1;

    const promedioDiario =
      daysInRange > 0 ? (totalReservas / daysInRange).toFixed(1) : "0";

    return {
      totalReservas,
      totalSalas,
      salaConMasReservas,
      maxReservas,
      promedioDiario,
      daysInRange,
    };
  }, [reportData, appliedStartDate, appliedEndDate]);

  return {
    loading,
    error,

    pendingStartDate,
    setPendingStartDate,
    pendingEndDate,
    setPendingEndDate,

    pendingReservationCount,
    setPendingReservationCount,
    appliedReservationCount,

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