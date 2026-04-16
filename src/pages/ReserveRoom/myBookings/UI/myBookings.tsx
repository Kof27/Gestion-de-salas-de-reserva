"use client";

import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";

import ReservationCard from "./reservationCard";
import ReservationCardSkeleton from "./reservationCardSkeleton";
import SummaryBox from "./summaryBox";

import { useMyReservations } from "@/src/pages/ReserveRoom/myBookings/hook/myBookingsHooks";

export default function MyReservationsPage() {
    const {
        reservations,
        loading,
        error,
        cancellingId,

        activeReservations,
        pastReservations,
        cancelledReservations,

        handleCancelReservation,
    } = useMyReservations();

    return (
        <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-360 px-8 pb-16 pt-14 lg:px-12">
                <section className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.35em] text-slate-900">
                            Gestión de espacios
                        </p>

                        <h1 className="text-6xl font-black tracking-[-0.06em] text-slate-900 sm:text-7xl">
                            Mis Reservas
                        </h1>

                        <p className="mt-5 max-w-2xl text-[1.15rem] leading-9 text-[#6a514c] sm:text-[1.2rem]">
                            Bienvenido a su agenda de espacios. Aquí podrá consultar y gestionar
                            sus próximas sesiones en nuestras instalaciones editoriales.
                        </p>
                    </div>

                    <div className="flex gap-5 lg:pt-24">
                        <SummaryBox
                            value={String(activeReservations.length).padStart(2, "0")}
                            label="ACTIVAS"
                        />
                        <SummaryBox
                            value={String(pastReservations.length).padStart(2, "0")}
                            label="PASADAS"
                        />
                        <SummaryBox
                            value={String(cancelledReservations.length).padStart(2, "0")}
                            label="CANCELADAS"
                        />
                    </div>
                </section>

                {loading ? (
                    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ReservationCardSkeleton key={index} />
                        ))}
                    </section>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
                        {error}
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
                        No hay reservas registradas.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {reservations.map((reservation) => (
                            <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                onCancel={handleCancelReservation}
                                cancellingId={cancellingId}
                            />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}