"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/src/widgets/navbar/ui/Navbar";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";
import { getRooms } from "@/src/shared/api/getRooms";
import type { Sala } from "@/src/entities/room";

type RoomStatus = "habilitada" | "inhabilitada";

type RoomView = {
    id: string;
    name: string;
    location: string;
    capacity: number;
    status: RoomStatus;
};

export const DashboardPage = () => {
    const [rooms, setRooms] = useState<RoomView[]>([]);
    const [roomToDelete, setRoomToDelete] = useState<RoomView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapSalaToRoomView = (room: Sala): RoomView => ({
        id: room.id_sala ?? "",
        name: room.nombre,
        location: room.ubicacion,
        capacity: room.capacidad,
        status: room.estado ? "habilitada" : "inhabilitada",
    });

    useEffect(() => {
        const loadRooms = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getRooms();
                setRooms(data.map(mapSalaToRoomView));
            } catch (err) {
                console.error("Error cargando salas:", err);
                setError("No se pudieron cargar las salas.");
            } finally {
                setLoading(false);
            }
        };

        loadRooms();
    }, []);

    const toggleStatus = (id: string) => {
        setRooms((prev) =>
            prev.map((r) =>
                r.id === id
                    ? {
                        ...r,
                        status:
                            r.status === "habilitada" ? "inhabilitada" : "habilitada",
                    }
                    : r
            )
        );
    };

    const confirmDelete = (room: RoomView) => {
        setRoomToDelete(room);
    };

    const handleDelete = () => {
        if (!roomToDelete) return;
        setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        setRoomToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Salas de Reuniones
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Administrar espacios para la Facultad de Ingeniería
                            </p>
                        </div>

                        <Link
                            href="/createRoom"
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                        >
                            + Crear Nueva Sala
                        </Link>
                    </div>

                    {loading ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Cargando salas...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                            {error}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            No hay salas registradas.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Nombre
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Ubicación
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Capacidad
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rooms.map((room) => (
                                        <tr
                                            key={room.id}
                                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-red-400"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {room.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {room.location}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    {room.capacity}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleStatus(room.id)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${room.status === "habilitada"
                                                                ? "bg-red-500"
                                                                : "bg-gray-300"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${room.status === "habilitada"
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                                }`}
                                                        />
                                                    </button>

                                                    <span
                                                        className={`text-sm ${room.status === "habilitada"
                                                                ? "text-gray-700"
                                                                : "text-gray-400"
                                                            }`}
                                                    >
                                                        {room.status === "habilitada"
                                                            ? "Habilitada"
                                                            : "Inhabilitada"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => confirmDelete(room)}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-red-500"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <Link
                                                        href={`/editRoom/${room.id}`}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-blue-500"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                            />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {roomToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/60">
                    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        <h2 className="mb-3 text-xl font-bold text-gray-900">
                            ¿Eliminar Sala de Reuniones?
                        </h2>

                        <p className="mb-7 text-sm leading-relaxed text-gray-500">
                            ¿Está seguro de que desea eliminar la sala{" "}
                            <span className="font-bold text-gray-800">
                                "{roomToDelete.name}"
                            </span>
                            ? Esta acción no se puede deshacer y se perderá todo el historial
                            asociado.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRoomToDelete(null)}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};