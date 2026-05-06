"use client";

import { useState, useMemo } from "react";
import {
    Search,
    SlidersHorizontal,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/src/shared/ui/FilterSelect";
import { cn } from "@/lib/utils";

import { useMyReservations } from "@/src/pages/ReserveRoom/myBookings/hook/myBookingsHooks";
import { statusLabel } from "@/src/pages/ReserveRoom/myBookings/lib/myBookingLib";
import type { ReservationView, ReservationStatus } from "../model/reservationView";
import ReservationModal from "./ReservationModal";
import { PageTransition } from "@/src/shared/ui/PageTransition";

const ITEMS_PER_PAGE = 10;

const dotColor: Record<string, string> = {
    active: "bg-emerald-500",
    past: "bg-slate-400",
    cancelled: "bg-red-500",
};

const statusTextColor: Record<string, string> = {
    active: "text-emerald-600",
    past: "text-slate-500",
    cancelled: "text-red-500",
};

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

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [page, setPage] = useState(1);
    const [selectedReservation, setSelectedReservation] = useState<ReservationView | null>(null);

    const filtered = useMemo(() => {
        let result = [...reservations];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.location.toLowerCase().includes(q) ||
                    r.motivo.toLowerCase().includes(q)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((r) => r.status === statusFilter);
        }

        if (sortOrder === "oldest") {
            result = result.reverse();
        }

        return result;
    }, [reservations, search, statusFilter, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const from = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
    const to = Math.min(page * ITEMS_PER_PAGE, filtered.length);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value as "all" | ReservationStatus);
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-[#f5f6f8] pt-15 text-slate-900">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8">
                <PageTransition>
                {/* Page header */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.3em] text-slate-400">
                            Gestión de espacios
                        </p>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Mis Reservas
                        </h1>
                    </div>

                    {/* Summary chips */}
                    {!loading && (
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {activeReservations.length} activas
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                {pastReservations.length} pasadas
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                {cancelledReservations.length} canceladas
                            </span>
                        </div>
                    )}
                </div>

                {/* Table card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {/* Filters */}
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar sala, ubicación o motivo..."
                                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-red-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <FilterSelect
                                value={statusFilter}
                                onChange={handleFilterChange}
                                icon={<SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                                options={[
                                    { value: "all", label: "Todas" },
                                    { value: "active", label: "Activas" },
                                    { value: "past", label: "Pasadas" },
                                    { value: "cancelled", label: "Canceladas" },
                                ]}
                            />

                            <FilterSelect
                                value={sortOrder}
                                onChange={(v) => {
                                    setSortOrder(v as "newest" | "oldest");
                                    setPage(1);
                                }}
                                options={[
                                    { value: "newest", label: "Más reciente" },
                                    { value: "oldest", label: "Más antiguo" },
                                ]}
                            />

                            <span className="text-sm text-slate-400 whitespace-nowrap">
                                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-175">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {["#", "Fecha", "Sala", "Horario", "Ubicación", "Motivo", "Estado", ""].map(
                                        (col) => (
                                            <th
                                                key={col}
                                                className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:pl-6 last:pr-6"
                                            >
                                                {col}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-300" />
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-sm text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-16 text-center text-sm text-slate-400"
                                        >
                                            No se encontraron reservas.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((r, i) => (
                                        <tr
                                            key={r.id}
                                            onClick={() => setSelectedReservation(r)}
                                            className="cursor-pointer transition-colors hover:bg-slate-50"
                                        >
                                            <td className="pl-6 pr-3 py-4 text-xs font-medium text-slate-400">
                                                {(page - 1) * ITEMS_PER_PAGE + i + 1}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                {r.fecha}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                                <span className="block max-w-40 truncate">
                                                    {r.title}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-mono text-slate-600 whitespace-nowrap">
                                                {r.horaInicio} — {r.horaFin}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                <span className="block max-w-35 truncate">
                                                    {r.location}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                <span className="block max-w-45 truncate">
                                                    {r.motivo}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={cn(
                                                        "flex items-center gap-1.5 text-xs font-bold whitespace-nowrap",
                                                        statusTextColor[r.status]
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            dotColor[r.status]
                                                        )}
                                                    />
                                                    {statusLabel(r.status)}
                                                </span>
                                            </td>
                                            <td className="pl-3 pr-6 py-4">
                                                <span className="text-xs font-semibold text-red-500 hover:text-red-700 whitespace-nowrap">
                                                    Ver detalle →
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filtered.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                            <span className="text-sm text-slate-400">
                                {from}–{to} de {filtered.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-slate-200"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="min-w-12 text-center text-sm text-slate-600">
                                    {page} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-slate-200"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                </PageTransition>
            </main>

            {/* Modal de detalle */}
            <ReservationModal
                reservation={selectedReservation}
                onClose={() => setSelectedReservation(null)}
                onCancel={handleCancelReservation}
                cancellingId={cancellingId}
            />
        </div>
    );
}
