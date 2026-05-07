"use client";

import { CalendarDays, Clock, FileText, Loader2, Save, X } from "lucide-react";

import Navbar2  from "@/src/widgets/navbar2/ui/Navbar2";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatHourLabel } from "@/src/pages/ReserveRoom/bookingEspecificRoom/lib/bookingSpecificRoomLib";
import { useEditBooking } from "@/src/pages/dashboard/editReserva/hook/useEditBookig";

export default function EditBooking() {
    const {
        reservaActual,

        fecha,
        setFecha,

        startTime,
        setStartTime,

        endTime,
        setEndTime,

        motivo,
        setMotivo,

        estado,
        setEstado,

        loading,
        saving,

        timeOptions,
        availableEndTimes,
        hasInvalidTime,
        canSubmit,

        handleSave,
        handleCancel,

        usuarioReserva
    } = useEditBooking();

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar2 />

                <section className="mx-auto flex max-w-5xl items-center justify-center px-6 py-20">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                        <p className="font-semibold text-slate-700">
                            Cargando información de la reserva...
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (!reservaActual) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Navbar2 />

                <section className="mx-auto max-w-5xl px-6 py-12">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-xl font-bold text-red-600">
                            No se encontró la reserva
                        </h1>

                        <p className="mt-2 text-sm text-red-500">
                            La reserva solicitada no existe o no pudo ser cargada.
                        </p>

                        <Button
                            onClick={handleCancel}
                            className="mt-5 bg-red-500 font-bold text-white hover:bg-red-600"
                        >
                            Volver
                        </Button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar2 />

            <section className="mx-auto max-w-5xl px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Editar reserva
                    </h1>

                    <p className="mt-2 text-base text-slate-500">
                        Actualiza la fecha, el horario, el estado y el motivo de la reserva.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Reserva #{reservaActual.id_reserva}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sala {reservaActual.id_sala} · Usuario{" "}
                                    {usuarioReserva?.nombre || `#${reservaActual.id_usuario}`}
                                </p>
                            </div>

                            <div
                                className={cn(
                                    "w-fit rounded-full px-4 py-2 text-sm font-bold",
                                    estado
                                        ? "bg-green-50 text-green-600"
                                        : "bg-red-50 text-red-600"
                                )}
                            >
                                {estado ? "Activa" : "Cancelada"}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CalendarDays className="h-4 w-4 text-red-500" />
                                Fecha
                            </label>

                            <input
                                type="date"
                                value={fecha}
                                onChange={(event) => setFecha(event.target.value)}
                                className={cn(
                                    "h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none transition",
                                    !fecha
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-slate-200 focus:border-red-500"
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Clock className="h-4 w-4 text-red-500" />
                                Estado
                            </label>

                            <select
                                value={estado ? "true" : "false"}
                                onChange={(event) => setEstado(event.target.value === "true")}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-red-500"
                            >
                                <option value="true">Activa</option>
                                <option value="false">Cancelada</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Clock className="h-4 w-4 text-red-500" />
                                Hora de inicio
                            </label>

                            <select
                                value={startTime}
                                onChange={(event) => setStartTime(event.target.value)}
                                className={cn(
                                    "h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none transition",
                                    !startTime
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-slate-200 focus:border-red-500"
                                )}
                            >
                                <option value="">Selecciona una hora</option>

                                {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                        {formatHourLabel(time)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Clock className="h-4 w-4 text-red-500" />
                                Hora de finalización
                            </label>

                            <select
                                value={endTime}
                                onChange={(event) => setEndTime(event.target.value)}
                                className={cn(
                                    "h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none transition",
                                    !endTime || hasInvalidTime
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-slate-200 focus:border-red-500"
                                )}
                            >
                                <option value="">Selecciona una hora</option>

                                {availableEndTimes.map((time) => (
                                    <option key={time} value={time}>
                                        {formatHourLabel(time)}
                                    </option>
                                ))}
                            </select>

                            {hasInvalidTime && (
                                <p className="text-xs font-semibold text-red-500">
                                    La hora final debe ser mayor que la hora inicial.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <FileText className="h-4 w-4 text-red-500" />
                                Motivo de la reserva
                            </label>

                            <textarea
                                value={motivo}
                                onChange={(event) => setMotivo(event.target.value)}
                                rows={5}
                                placeholder="Escribe el motivo de la reserva..."
                                className={cn(
                                    "w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm font-medium outline-none transition",
                                    !motivo.trim()
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-slate-200 focus:border-red-500"
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={saving}
                            className="font-bold text-slate-600"
                        >
                            Cancelar
                            <X className="ml-2 h-4 w-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSubmit}
                            className={cn(
                                "font-bold text-white",
                                canSubmit
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "cursor-not-allowed bg-slate-300 hover:bg-slate-300"
                            )}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}

                            {saving ? (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="ml-2 h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}