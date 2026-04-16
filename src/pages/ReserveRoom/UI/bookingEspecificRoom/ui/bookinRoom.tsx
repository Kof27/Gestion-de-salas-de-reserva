"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertCircle,
    CalendarIcon,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { useBookingRoom } from "@/src/pages/ReserveRoom/UI/bookingEspecificRoom/hook/useBookingEspecificRoom";

type BookingRoomWindowsProps = {
    roomId?: string;
};

export default function BookingRoomWindows({ roomId }: BookingRoomWindowsProps) {
    const {
        room,
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
            <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col items-center justify-center">
                <p className="text-lg text-slate-600">
                    Cargando información de la sala...
                </p>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col items-center justify-center">
                <p className="text-lg text-red-600">
                    {error || "No se pudo cargar la sala"}
                </p>
            </div>
        );
    }

    return (
        <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden">
            <div className="w-full h-16 shrink-0 bg-[#F1F5F9] rounded-t-2xl flex items-center justify-start px-6 py-4 border-b">
                <h1 className="text-2xl font-bold text-slate-900">
                    Reservar Sala {room.nombre}
                </h1>
            </div>

            <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.65fr_0.85fr]">
                <div className="p-6 border-r bg-white overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="rounded-2xl border bg-white p-4 flex justify-center">
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
                                    caption:
                                        "flex justify-center pt-1 relative items-center text-slate-900",
                                    caption_label: "text-lg font-bold",
                                    nav: "space-x-1 flex items-center",
                                    nav_button:
                                        "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full justify-between",
                                    head_cell:
                                        "text-slate-500 rounded-md w-10 font-semibold text-[0.8rem]",
                                    row: "flex w-full mt-2 justify-between",
                                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                    day: cn(
                                        "h-10 w-10 p-0 font-semibold rounded-full",
                                        "aria-selected:opacity-100"
                                    ),
                                    day_selected:
                                        "bg-[#22C55E] text-white hover:bg-[#16A34A] focus:bg-[#16A34A]",
                                    day_today: "bg-slate-100 text-slate-900",
                                    day_outside: "text-slate-300 opacity-50",
                                    day_disabled:
                                        "text-slate-300 opacity-40 line-through cursor-not-allowed",
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Hora de inicio
                                    </label>

                                    <Select value={startTime} onValueChange={setStartTime}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="w-4 h-4 text-slate-500" />
                                                <SelectValue placeholder="Selecciona hora inicio" />
                                            </div>
                                        </SelectTrigger>

                                        <SelectContent>
                                            {allTimes.slice(0, -1).map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {formatHourLabel(time)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Hora de fin
                                    </label>

                                    <Select value={endTime} onValueChange={setEndTime}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="w-4 h-4 text-slate-500" />
                                                <SelectValue placeholder="Selecciona hora fin" />
                                            </div>
                                        </SelectTrigger>

                                        <SelectContent>
                                            {endTimeOptions.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {formatHourLabel(time)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "rounded-xl border px-4 py-3 text-sm flex items-start gap-3",
                                    hasConflict
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : "border-green-200 bg-green-50 text-green-700"
                                )}
                            >
                                {hasConflict ? (
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                )}

                                <div>
                                    {hasConflict
                                        ? "La franja seleccionada entra en conflicto con una reserva existente. Cambia la hora para continuar."
                                        : "La franja seleccionada está disponible."}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Motivo de la reunión{" "}
                                    <span className="font-normal text-slate-400">
                                        (opcional)
                                    </span>
                                </label>

                                <Textarea
                                    value={meetingReason}
                                    onChange={(e) => setMeetingReason(e.target.value)}
                                    placeholder="Ej. Revisión de proyecto de tesis..."
                                    className="min-h-35 resize-none rounded-xl"
                                />
                            </div>

                            <div className="rounded-2xl border bg-slate-50 p-4">
                                <div className="flex items-center gap-2 mb-2 text-slate-700">
                                    <CalendarIcon className="w-4 h-4" />
                                    <p className="text-sm font-semibold">Resumen de reserva</p>
                                </div>

                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>
                                        <span className="font-semibold text-slate-800">
                                            Fecha:
                                        </span>{" "}
                                        {selectedDate
                                            ? format(selectedDate, "d 'de' MMMM yyyy", {
                                                locale: es,
                                            })
                                            : "No seleccionada"}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-slate-800">
                                            Horario:
                                        </span>{" "}
                                        {formatHourLabel(startTime)} - {formatHourLabel(endTime)}
                                    </p>

                                    <p>
                                        <span className="font-semibold text-slate-800">
                                            Sala:
                                        </span>{" "}
                                        {room.nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 overflow-y-auto min-h-0">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarIcon className="w-5 h-5 text-[#22C55E]" />
                        <h2 className="text-xl font-bold text-slate-900">
                            Disponibilidad para{" "}
                            {selectedDate
                                ? format(selectedDate, "d MMM", { locale: es })
                                : "la fecha"}
                        </h2>
                    </div>

                    <div className="relative pl-8">
                        <div className="absolute left-2.75 top-0 bottom-0 w-px bg-slate-300" />

                        <div className="space-y-5">
                            {agendaItems.map((item, index) => {
                                const isBusy = item.status === "busy";
                                const isCurrent = item.status === "current";

                                return (
                                    <div
                                        key={`${item.start}-${item.end}-${index}`}
                                        className="relative"
                                    >
                                        <div
                                            className={cn(
                                                "absolute -left-0.5 top-1 h-6 w-6 rounded-full border-4 bg-white",
                                                isBusy && "border-red-500",
                                                isCurrent && "border-[#22C55E]",
                                                item.status === "free" && "border-slate-300"
                                            )}
                                        />

                                        <div className="ml-6">
                                            <p
                                                className={cn(
                                                    "text-sm font-semibold",
                                                    isBusy && "text-slate-600",
                                                    isCurrent && "text-[#22C55E]",
                                                    item.status === "free" && "text-slate-600"
                                                )}
                                            >
                                                {formatHourLabel(item.start)} -{" "}
                                                {formatHourLabel(item.end)}
                                            </p>

                                            {item.status === "free" && (
                                                <p className="text-[28px] leading-none text-slate-700 mt-1">
                                                    Libre
                                                </p>
                                            )}

                                            {isBusy && (
                                                <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                                    <p className="font-bold text-red-600">Reservado</p>
                                                    <p className="text-red-500 text-sm">
                                                        {item.booking?.title || "Sala ocupada"}
                                                    </p>
                                                </div>
                                            )}

                                            {isCurrent && (
                                                <div className="mt-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                                    <p className="font-bold text-[#22C55E]">
                                                        Tu reserva actual
                                                    </p>
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

            <div className="w-full h-16 shrink-0 bg-[#F1F5F9] rounded-b-2xl flex items-center justify-end px-6 py-4 gap-3 border-t">
                <Button variant="ghost" className="text-[#475569] font-semibold text-sm">
                    Cancelar
                </Button>

                <Button
                    onClick={handleConfirmReservation}
                    disabled={hasConflict || submitting}
                    className={cn(
                        "text-white font-bold px-4 py-2 rounded-lg",
                        hasConflict || submitting
                            ? "bg-slate-300 hover:bg-slate-300 cursor-not-allowed"
                            : "bg-[#22C55E] hover:bg-[#16A34A]"
                    )}
                >
                    {submitting ? "Confirmando..." : "Confirmar reserva"}
                    {!submitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}