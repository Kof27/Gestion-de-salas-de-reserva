"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

import { getReservas, cancelarReserva } from "@/src/shared/api/getReservas";
import { getRooms } from "@/src/shared/api/getRooms";
import { getUsuarios } from "@/src/shared/api/getUsuario";

import type { usuario } from "@/src/entities/usuario";
import type { FilterStatus, ReservationView } from "../lib/bookingMapper";
import { mapReservaToView } from "../lib/bookingMapper";

type AulaFilter = "todas" | "1" | "2" | "3" | "4";
type PisoFilter = "todos" | "1" | "2" | "3" | "4";

function getAulaYPisoFromLocation(location: string) {
    /*
        Formato esperado:
        A2. Salón 232

        A2  = Aulas 2 / edificio 2
        232 = piso 2, salón 32

        Regla:
        - El número después de la A indica el aula/edificio.
        - El primer número después de "Salón" indica el piso.
    */

    const match = location.match(/A(\d+)\.\s*Salón\s*(\d+)/i);

    if (!match) {
        return {
            aula: "",
            piso: "",
        };
    }

    const aula = match[1];
    const codigoSalon = match[2];

    return {
        aula,
        piso: codigoSalon[0] || "",
    };
}

function getUsuarioFromLocalStorage(): usuario | null {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser) as usuario;
    } catch (error) {
        console.error("Error leyendo usuario desde localStorage:", error);
        return null;
    }
}

function getNombreUsuario(user: usuario) {
    const possibleUser = user as usuario & {
        nombre?: string;
        apellido?: string;
        nombres?: string;
        apellidos?: string;
        nombre_usuario?: string;
        correo?: string;
        email?: string;
    };

    const nombre =
        possibleUser.nombre ||
        possibleUser.nombres ||
        possibleUser.nombre_usuario ||
        "";

    const apellido =
        possibleUser.apellido ||
        possibleUser.apellidos ||
        "";

    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return (
        nombreCompleto ||
        possibleUser.correo ||
        possibleUser.email ||
        `Usuario ${user.id_usuario}`
    );
}

function isSameOrAfter(date: Date, comparison: Date) {
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const normalizedComparison = new Date(
        comparison.getFullYear(),
        comparison.getMonth(),
        comparison.getDate()
    );

    return normalizedDate >= normalizedComparison;
}

function isSameOrBefore(date: Date, comparison: Date) {
    const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const normalizedComparison = new Date(
        comparison.getFullYear(),
        comparison.getMonth(),
        comparison.getDate()
    );

    return normalizedDate <= normalizedComparison;
}

function sortReservationsByMostRecent(a: ReservationView, b: ReservationView) {
    const dateA = new Date(a.start).getTime();
    const dateB = new Date(b.start).getTime();

    return dateB - dateA;
}

export function useAllBookings() {
    const [reservations, setReservations] = useState<ReservationView[]>([]);
    const [reservationToDelete, setReservationToDelete] =
        useState<ReservationView | null>(null);

    const [users, setUsers] = useState<usuario[]>([]);
    const [teachers, setTeachers] = useState<usuario[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deletingReservationId, setDeletingReservationId] =
        useState<string | null>(null);

    const [aulaFilter, setAulaFilter] = useState<AulaFilter>("todas");
    const [pisoFilter, setPisoFilter] = useState<PisoFilter>("todos");
    const [teacherFilter, setTeacherFilter] = useState<string>("todos");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("todas");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const secretaria = getUsuarioFromLocalStorage();

                const [reservasData, roomsData, usuariosData] = await Promise.all([
                    getReservas(),
                    getRooms(),
                    getUsuarios(),
                ]);

                setUsers(usuariosData);
                console.log("Usuarios cargados:", usuariosData);
                const secretariaIdFacultad = secretaria?.id_facultad;
                console.log("Secretaria ID Facultad:", secretariaIdFacultad);
                const usuariosMismaFacultad = usuariosData.filter((user) => user.id_facultad === secretariaIdFacultad);
                console.log("Usuarios de la misma facultad:", usuariosMismaFacultad);
                setTeachers(usuariosMismaFacultad);

                const reservasMismaFacultad = reservasData.filter((reserva) => {
                    if (!secretariaIdFacultad) return false;

                    const usuarioQueReservo = usuariosData.find(
                        (user) => String(user.id_usuario) === String(reserva.id_usuario)
                    );

                    return String(usuarioQueReservo?.id_facultad) === String(secretariaIdFacultad);
                });

                setReservations(
                    reservasMismaFacultad
                        .map((item) => mapReservaToView(item, roomsData))
                        .sort(sortReservationsByMostRecent)
                );
            } catch (err) {
                console.error("Error cargando reservas:", err);
                setError("No se pudieron cargar las reservas.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredReservations = useMemo(() => {
        return reservations
            .filter((reservation) => {
                const { aula, piso } = getAulaYPisoFromLocation(
                    reservation.location || ""
                );

                const matchesAula =
                    aulaFilter === "todas" || aula === aulaFilter;

                const matchesPiso =
                    pisoFilter === "todos" || piso === pisoFilter;

                const matchesTeacher =
                    teacherFilter === "todos" ||
                    String(reservation.raw.id_usuario) ===
                    String(teacherFilter) ||
                    String(reservation.userId) === String(teacherFilter);

                const matchesStatus =
                    statusFilter === "todas"
                        ? true
                        : statusFilter === "activas"
                            ? reservation.status === "activa"
                            : reservation.status === "cancelada";

                const reservationDate = new Date(reservation.start);

                const matchesDate = (() => {
                    if (!dateRange?.from) return true;

                    if (dateRange.from && !dateRange.to) {
                        return (
                            isSameOrAfter(reservationDate, dateRange.from) &&
                            isSameOrBefore(reservationDate, dateRange.from)
                        );
                    }

                    if (dateRange.from && dateRange.to) {
                        return (
                            isSameOrAfter(reservationDate, dateRange.from) &&
                            isSameOrBefore(reservationDate, dateRange.to)
                        );
                    }

                    return true;
                })();

                return (
                    matchesAula &&
                    matchesPiso &&
                    matchesTeacher &&
                    matchesStatus &&
                    matchesDate
                );
            })
            .sort(sortReservationsByMostRecent);
    }, [
        reservations,
        aulaFilter,
        pisoFilter,
        teacherFilter,
        statusFilter,
        dateRange,
    ]);

    const getUserNameById = (idUsuario: string | number) => {
        const user = users.find(
            (item) => String(item.id_usuario) === String(idUsuario)
        );

        if (!user) return `Usuario ${idUsuario}`;

        return getNombreUsuario(user);
    };

    const clearDateRange = () => {
        setDateRange(undefined);
    };

    const openDeleteModal = (reservation: ReservationView) => {
        setReservationToDelete(reservation);
    };

    const closeDeleteModal = () => {
        setReservationToDelete(null);
    };

    const handleDelete = async () => {
        if (!reservationToDelete) return;
        if (deletingReservationId) return;

        try {
            setDeletingReservationId(reservationToDelete.id);

            await cancelarReserva(reservationToDelete.raw);

            setReservations((prev) =>
                prev
                    .map((item): ReservationView =>
                        item.id === reservationToDelete.id
                            ? {
                                ...item,
                                status: "cancelada" as ReservationView["status"],
                                raw: {
                                    ...item.raw,
                                    estado: false,
                                },
                            }
                            : item
                    )
                    .sort(sortReservationsByMostRecent)
            );

            toast.success("Operación exitosa", {
                description: `La reserva de la sala "${reservationToDelete.roomName}" fue cancelada correctamente.`,
            });

            setReservationToDelete(null);
        } catch (error) {
            console.error("Error cancelando reserva:", error);

            const message = error instanceof Error ? error.message : "";

            const isConnectionError =
                error instanceof TypeError ||
                message.includes("Failed to fetch") ||
                message.includes("NetworkError") ||
                message.includes("ERR_CONNECTION_REFUSED") ||
                message.includes("ECONNREFUSED");

            if (isConnectionError) {
                toast.error("No se pudo conectar con el servidor", {
                    description:
                        "Verifica que el backend esté encendido e intenta nuevamente.",
                });
                return;
            }

            toast.error("La operación no fue exitosa", {
                description: "No se pudo cancelar la reserva.",
            });
        } finally {
            setDeletingReservationId(null);
        }
    };

    return {
        reservations,
        filteredReservations,
        reservationToDelete,
        teachers,
        loading,
        error,
        deletingReservationId,

        aulaFilter,
        pisoFilter,
        teacherFilter,
        statusFilter,
        dateRange,

        setAulaFilter,
        setPisoFilter,
        setTeacherFilter,
        setStatusFilter,
        setDateRange,
        clearDateRange,

        getNombreUsuario,
        getUserNameById,

        openDeleteModal,
        closeDeleteModal,
        handleDelete,
    };
}