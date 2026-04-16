"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import BookingRoomWindows from "../../bookingEspecificRoom/ui/bookinRoom";
import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";
import RoomCard from "./roomCard";

import { useRoomBooking } from "@/src/pages/ReserveRoom/bookingRoomMainInterface/hook/RoomMainInterafeHooks";

export default function RoomBookingPage() {
    const {
        search,
        setSearch,

        filteredRooms,

        loading,
        error,

        selectedRoom,
        isModalOpen,

        handleReservar,
        handleCloseModal,
    } = useRoomBooking();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
                <p className="text-lg text-slate-600">Cargando salas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
                <p className="text-lg text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                            Salas disponibles
                        </h1>

                        <p className="mt-3 max-w-2xl text-lg text-slate-600">
                            Encuentra y reserva espacios para tus reuniones académicas.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar sala..."
                                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-base placeholder:text-slate-400 focus-visible:ring-red-500"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {filteredRooms.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                        No se encontraron salas disponibles.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {filteredRooms.map((room) => (
                            <RoomCard
                                key={room.id_sala}
                                room={room}
                                onReservar={handleReservar}
                            />
                        ))}
                    </section>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    <div className="relative">
                        <BookingRoomWindows roomId={selectedRoom?.id_sala} />
                    </div>
                </div>
            )}
        </div>
    );
}