"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/src/shared/ui/FilterSelect";
import { cn } from "@/lib/utils";

import BookingRoomWindows from "../../bookingEspecificRoom/ui/bookinRoom";
import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";
import RoomCard from "./roomCard";

import { useRoomBooking } from "@/src/pages/ReserveRoom/bookingRoomMainInterface/hook/RoomMainInterafeHooks";
import type { RoomStatusFilter } from "@/src/pages/ReserveRoom/bookingRoomMainInterface/hook/RoomMainInterafeHooks";
import { PageTransition } from "@/src/shared/ui/PageTransition";

export default function RoomBookingPage() {
    const {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        rooms,
        filteredRooms,
        loading,
        error,
        selectedRoom,
        isModalOpen,
        handleReservar,
        handleCloseModal,
    } = useRoomBooking();

    const [nombreUsuario, setNombreUsuario] = useState("");
    const [shouldRenderModal, setShouldRenderModal] = useState(false);
    const [closingModal, setClosingModal] = useState(false);

    useEffect(() => {
        if (isModalOpen) {
            setShouldRenderModal(true);
            setClosingModal(false);
        } else if (shouldRenderModal) {
            setClosingModal(true);
            const t = setTimeout(() => {
                setShouldRenderModal(false);
                setClosingModal(false);
            }, 200);
            return () => clearTimeout(t);
        }
    }, [isModalOpen, shouldRenderModal]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("usuario");
            if (raw) {
                const u = JSON.parse(raw);
                setNombreUsuario(u.nombre ?? "");
            }
        } catch {
            // localStorage no disponible o JSON inválido
        }
    }, []);

    const salasDisponibles = rooms.filter((r) => r.estado).length;
    const salasNoDisponibles = rooms.filter((r) => !r.estado).length;

    return (
        <div className="min-h-screen bg-[#f5f6f8] pt-24 text-slate-900 md:pt-15">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <PageTransition>
                {/* Dashboard header */}
                <div className="mb-6">
                    {nombreUsuario && (
                        <p className="mb-1 text-sm font-medium text-slate-500">
                            Bienvenido,{" "}
                            <span className="font-semibold text-slate-700">{nombreUsuario}</span>
                        </p>
                    )}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                            Salas disponibles
                        </h1>

                        {/* Search + filter */}
                        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar sala..."
                                    className="h-9 w-full rounded-lg border-slate-200 bg-white pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-red-500 sm:w-48"
                                />
                            </div>
                            <FilterSelect
                                value={statusFilter}
                                onChange={(v) => setStatusFilter(v as RoomStatusFilter)}
                                icon={<SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                                options={[
                                    { value: "all", label: "Todas" },
                                    { value: "available", label: "Disponibles" },
                                    { value: "unavailable", label: "No disponibles" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                {!loading && !error && (
                    <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-slate-600" />
                            {rooms.length} totales
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {salasDisponibles} disponibles
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            {salasNoDisponibles} no disponibles
                        </span>
                    </div>
                )}

                {/* Room grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
                        {error}
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        No se encontraron salas disponibles.
                    </div>
                ) : (
                    <>
                        {(search || statusFilter !== "all") && (
                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                {filteredRooms.length} resultado{filteredRooms.length !== 1 ? "s" : ""}
                            </p>
                        )}
                        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredRooms.map((room) => (
                                <RoomCard
                                    key={room.id_sala}
                                    room={room}
                                    onReservar={handleReservar}
                                />
                            ))}
                        </section>
                    </>
                )}
                </PageTransition>
            </main>

            {shouldRenderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
                    <div
                        className={cn(
                            "absolute inset-0 bg-black/30 backdrop-blur-sm",
                            closingModal
                                ? "animate-out fade-out duration-200"
                                : "animate-in fade-in duration-200"
                        )}
                        onClick={handleCloseModal}
                    />
                    <div
                        className={cn(
                            "relative w-full h-full sm:h-auto sm:w-auto",
                            closingModal
                                ? "animate-out fade-out zoom-out-95 slide-out-to-bottom-4 duration-200"
                                : "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        )}
                    >
                        <BookingRoomWindows roomId={selectedRoom?.id_sala} onClose={handleCloseModal} />
                    </div>
                </div>
            )}
        </div>
    );
}
