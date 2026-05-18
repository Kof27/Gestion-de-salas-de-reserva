"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertCircle,
    CalendarIcon,
    CheckCircle2,
    Clock3,
    MapPin,
    Users,
    Building2,
    FileText,
    Monitor,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useBookingRoom } from "@/src/pages/ReserveRoom/bookingEspecificRoom/hook/useBookingEspecificRoom";

type BookingRoomWindowsProps = {
    roomId?: string;
    onClose?: () => void;
};

export default function BookingRoomWindows({ roomId, onClose }: BookingRoomWindowsProps) {
    const {
        room,
        resources,
        loading,
        error,
        submitting,
        selectedDate,
        handleSelectDate,
        isDateDisabled,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        meetingReason,
        setMeetingReason,
        allTimes,
        endTimeOptions,
        agendaItems,
        hasConflict,
        handleConfirmReservation,
        formatHourLabel,
    } = useBookingRoom({ roomId });

    if (loading) {
        return (
            <div className="w-full h-full sm:w-[95vw] sm:max-w-275 sm:h-[85vh] bg-white sm:rounded-2xl flex items-center justify-center">
                <p className="text-sm text-slate-400">Cargando sala...</p>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="w-full h-full sm:w-[95vw] sm:max-w-275 sm:h-[85vh] bg-white sm:rounded-2xl flex items-center justify-center">
                <p className="text-sm text-red-500">{error || "No se pudo cargar la sala"}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-white flex flex-col shadow-2xl sm:w-[95vw] sm:max-w-275 sm:h-[85vh] sm:rounded-2xl lg:overflow-hidden">

            {/* ── Header ── */}
            <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-3 sm:px-6 sm:py-4 sm:gap-4 lg:shrink-0">
                {room.imagen_sala ? (
                    <img
                        src={room.imagen_sala}
                        alt={room.nombre}
                        className="h-12 w-16 rounded-lg object-cover shrink-0 sm:h-14 sm:w-20 sm:rounded-xl"
                    />
                ) : (
                    <div className="h-12 w-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 sm:h-14 sm:w-20 sm:rounded-xl">
                        <Building2 className="h-6 w-6 text-slate-300" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-base font-extrabold text-slate-900 tracking-tight sm:text-lg">
                            {room.nombre}
                        </h1>
                        <Badge className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                            room.estado
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-50"
                        )}>
                            <span className={cn(
                                "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                                room.estado ? "bg-emerald-500" : "bg-red-500"
                            )} />
                            {room.estado ? "Disponible" : "No disponible"}
                        </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {room.ubicacion && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {room.ubicacion}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 shrink-0" />
                            {room.capacidad} personas
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="grid grid-cols-1 lg:flex-1 lg:min-h-0 lg:grid-cols-[1.65fr_0.85fr]">

                {/* Left — form */}
                <div className="p-4 border-b border-slate-100 bg-white sm:p-6 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:min-h-0">
                    <div className="flex flex-col gap-5">

                        {/* Calendar */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-2 flex justify-center sm:p-4">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleSelectDate}
                                disabled={isDateDisabled}
                                locale={es}
                                month={selectedDate}
                                onMonthChange={handleSelectDate}
                                className="p-0"
                                classNames={{
                                    months: "flex flex-col",
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center text-slate-900",
                                    caption_label: "text-base font-bold",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full justify-between",
                                    head_cell: "text-slate-400 rounded-md w-10 font-semibold text-[0.75rem]",
                                    row: "flex w-full mt-2 justify-between",
                                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                    day: cn("h-10 w-10 p-0 font-semibold rounded-full", "aria-selected:opacity-100"),
                                    day_selected: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600",
                                    day_today: "bg-slate-100 text-slate-900",
                                    day_outside: "text-slate-300 opacity-50",
                                    day_disabled: "text-slate-300 opacity-40 line-through cursor-not-allowed",
                                }}
                            />
                        </div>

                        {/* Time selectors */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5 min-w-0">
                                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Hora de inicio
                                </label>
                                <Select modal={false} value={startTime} onValueChange={setStartTime}>
                                    <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock3 className="w-4 h-4 text-slate-400" />
                                            <SelectValue placeholder="Hora inicio" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {allTimes.slice(0, -1).map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {formatHourLabel(time)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5 min-w-0">
                                <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Hora de fin
                                </label>
                                <Select modal={false} value={endTime} onValueChange={setEndTime}>
                                    <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock3 className="w-4 h-4 text-slate-400" />
                                            <SelectValue placeholder="Hora fin" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {endTimeOptions.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {formatHourLabel(time)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Conflict indicator */}
                        <div className={cn(
                            "rounded-xl border px-4 py-3 text-sm flex items-start gap-3",
                            hasConflict
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        )}>
                            {hasConflict
                                ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                            }
                            <span>
                                {hasConflict
                                    ? "La franja seleccionada entra en conflicto con una reserva existente. Cambia la hora para continuar."
                                    : "La franja seleccionada está disponible."}
                            </span>
                        </div>

                        {/* Reason */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                Motivo de la reunión{" "}
                                <span className="normal-case font-normal text-slate-400">(opcional)</span>
                            </label>
                            <Textarea
                                value={meetingReason}
                                onChange={(e) => setMeetingReason(e.target.value)}
                                placeholder="Ej. Revisión de proyecto de tesis..."
                                className="min-h-24 resize-none rounded-xl border-slate-200 text-sm"
                            />
                        </div>

                        {/* Summary */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Resumen de reserva
                                </p>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p>
                                    <span className="font-semibold text-slate-800">Fecha:</span>{" "}
                                    {selectedDate
                                        ? format(selectedDate, "d 'de' MMMM yyyy", { locale: es })
                                        : "No seleccionada"}
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Horario:</span>{" "}
                                    {formatHourLabel(startTime)} — {formatHourLabel(endTime)}
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Sala:</span>{" "}
                                    {room.nombre}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — room info + availability */}
                <div className="bg-slate-50 p-4 flex flex-col gap-5 sm:p-6 lg:overflow-y-auto lg:min-h-0">

                    {/* Room description */}
                    {room.descripcion && (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Descripción
                                </p>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {room.descripcion}
                            </p>
                        </div>
                    )}

                    {/* Equipamiento */}
                    {resources.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                    Equipamiento
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {resources.map((r) => (
                                    <div key={r.id_recurso} className="flex items-start gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 leading-tight">
                                                {r.nombre}
                                            </p>
                                            {r.descripcion && (
                                                <p className="text-xs text-slate-400 leading-snug mt-0.5">
                                                    {r.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Availability timeline */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                                Disponibilidad —{" "}
                                {selectedDate
                                    ? format(selectedDate, "d MMM", { locale: es })
                                    : "fecha"}
                            </h2>
                        </div>

                        <div className="relative pl-7">
                            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-200" />
                            <div className="space-y-4">
                                {agendaItems.map((item, index) => {
                                    const isBusy = item.status === "busy";
                                    const isCurrent = item.status === "current";
                                    return (
                                        <div key={`${item.start}-${item.end}-${index}`} className="relative">
                                            <div className={cn(
                                                "absolute -left-0.5 top-1 h-5 w-5 rounded-full border-[3px] bg-white",
                                                isBusy && "border-red-400",
                                                isCurrent && "border-emerald-500",
                                                item.status === "free" && "border-slate-300"
                                            )} />
                                            <div className="ml-5">
                                                <p className={cn(
                                                    "text-xs font-semibold",
                                                    isBusy && "text-slate-500",
                                                    isCurrent && "text-emerald-600",
                                                    item.status === "free" && "text-slate-500"
                                                )}>
                                                    {formatHourLabel(item.start)} — {formatHourLabel(item.end)}
                                                </p>
                                                {item.status === "free" && (
                                                    <p className="text-sm text-slate-400 mt-0.5">Libre</p>
                                                )}
                                                {isBusy && (
                                                    <div className="mt-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                                                        <p className="text-xs font-bold text-red-600">Reservado</p>
                                                        <p className="text-xs text-red-400 mt-0.5">
                                                            {item.booking?.title || "Sala ocupada"}
                                                        </p>
                                                    </div>
                                                )}
                                                {isCurrent && (
                                                    <div className="mt-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                                                        <p className="text-xs font-bold text-emerald-600">Tu reserva actual</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-4 py-3 flex items-center justify-end gap-2 sm:px-6 sm:py-4 sm:gap-3 lg:static lg:shrink-0">
                <Button
                    variant="ghost"
                    className="text-slate-500 font-semibold text-sm hover:text-slate-700"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirmReservation}
                    disabled={hasConflict || submitting}
                    className={cn(
                        "font-bold text-sm px-4 rounded-xl text-white sm:px-6",
                        hasConflict || submitting
                            ? "bg-slate-300 cursor-not-allowed hover:bg-slate-300"
                            : "bg-red-500 hover:bg-red-600"
                    )}
                >
                    {submitting ? "Confirmando..." : "Confirmar reserva"}
                    {!submitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
