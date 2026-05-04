"use client";

import Link from "next/link";
import { Search, Loader2, CalendarDays, MapPin, User, Pencil, Trash2 } from "lucide-react";

import { Navbar } from "@/src/widgets/navbar/ui/Navbar";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";
import { useAllBookings } from "../hook/useAllBookings";
import { formatReservationDate } from "../lib/bookingMapper";

export function AllBookingsPage() {
    const {
        filteredReservations,
        reservationToDelete,
        loading,
        error,
        deletingReservationId,
        searchTerm,
        statusFilter,
        setSearchTerm,
        setStatusFilter,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
    } = useAllBookings();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Administrar y consultar todas las reservas de salas
                            </p>
                        </div>

                        <Link
                            href="/booking"
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                        >
                            + Reservar una sala
                        </Link>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Buscar por sala o ubicación
                            </label>
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por sala o ubicación..."
                                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Filtrar por estado
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as "todas" | "activas" | "canceladas")}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none"
                            >
                                <option value="todas">Todas</option>
                                <option value="activas">Activas</option>
                                <option value="canceladas">Canceladas</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Cargando reservas...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                            {error}
                        </div>
                    ) : filteredReservations.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            No hay reservas que coincidan con los filtros.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sala</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ubicación</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Inicio</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fin</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Motivo</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredReservations.map((reservation) => (
                                        <tr
                                            key={reservation.id}
                                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                                                        <CalendarDays className="h-4 w-4 text-red-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {reservation.roomName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4" />
                                                    {reservation.location}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <User className="h-4 w-4" />
                                                    {reservation.userId}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatReservationDate(reservation.start)}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatReservationDate(reservation.end)}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {reservation.reason}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${reservation.status === "activa"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-200 text-gray-600"
                                                        }`}
                                                >
                                                    {reservation.status === "activa" ? "Activa" : "Cancelada"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openDeleteModal(reservation)}
                                                        disabled={reservation.status === "cancelada" || !!deletingReservationId}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Cancelar reserva"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                    <Link
                                                        href={`/editBooking/${reservation.id}`}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-blue-500"
                                                        title="Modificar reserva"
                                                    >
                                                        <Pencil className="h-4 w-4" />
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

            {reservationToDelete && (
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
                            ¿Cancelar reserva?
                        </h2>

                        <p className="mb-7 text-sm leading-relaxed text-gray-500">
                            ¿Está seguro de que desea cancelar la reserva de la sala{" "}
                            <span className="font-bold text-gray-800">"{reservationToDelete.roomName}"</span>?
                            Esta acción cambiará el estado de la reserva a cancelada.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={!!deletingReservationId}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!!deletingReservationId}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {deletingReservationId ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Cancelando...
                                    </>
                                ) : (
                                    "Cancelar reserva"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}