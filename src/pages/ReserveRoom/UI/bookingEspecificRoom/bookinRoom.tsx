"use client"

import * as React from "react"
import { format, isSameDay, setHours, setMinutes, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, CheckCircle2, Circle, Clock3, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getRoomById } from "../../API/getRooms"
import { getReservas, createReserva } from "../../API/getReservas"
import type { Sala } from "@/src/entities/room"
import type { reserva } from "@/src/entities/reserva"

type Booking = {
    id: string
    roomId: string
    title: string
    date: Date
    start: string // "HH:mm"
    end: string   // "HH:mm"
}

type TimeSlotStatus = "free" | "busy" | "current"

// Función para convertir reservas del backend al formato Booking
function convertReservaToBooking(reserva: reserva): Booking {
    const startDate = new Date(reserva.hora_inicio)
    const endDate = new Date(reserva.hora_fin)
    
    const start = format(startDate, "HH:mm")
    const end = format(endDate, "HH:mm")
    
    return {
        id: reserva.id_reserva || "",
        roomId: String(reserva.id_sala),
        title: reserva.motivo,
        date: startDate,
        start,
        end,
    }
}

function parseTimeToMinutes(time: string) {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
}

function minutesToTime(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatHourLabel(time: string) {
    const [hours, minutes] = time.split(":").map(Number)
    const date = setMinutes(setHours(new Date(), hours), minutes)
    return format(date, "hh:mm a", { locale: es })
}

function generateTimeOptions() {
    const start = 7 * 60 // 07:00
    const end = 21 * 60 + 30 // 21:30
    const times: string[] = []

    for (let current = start; current <= end; current += 30) {
        times.push(minutesToTime(current))
    }

    return times
}

function generateAgendaSlots() {
    const slots: { start: string; end: string }[] = []
    const start = 7 * 60       // 07:00
    const end = 21 * 60 + 30   // 21:30
    const duration = 30        // bloques de 30 minutos

    for (let current = start; current + duration <= end; current += 30) {
        slots.push({
            start: minutesToTime(current),
            end: minutesToTime(current + duration),
        })
    }

    return slots
}

function rangesOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
) {
    const aStart = parseTimeToMinutes(startA)
    const aEnd = parseTimeToMinutes(endA)
    const bStart = parseTimeToMinutes(startB)
    const bEnd = parseTimeToMinutes(endB)

    return aStart < bEnd && aEnd > bStart
}

function getAvailableEndTimes(startTime: string, allTimes: string[]) {
    const startMinutes = parseTimeToMinutes(startTime)
    return allTimes.filter((time) => parseTimeToMinutes(time) > startMinutes)
}

export default function BookingRoomWindows({ roomId }: { roomId?: string }) {
    const allTimes = React.useMemo(() => generateTimeOptions(), [])
    const agendaSlots = React.useMemo(() => generateAgendaSlots(), [])
    const effectiveRoomId = roomId || "1"

    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
    const [startTime, setStartTime] = React.useState("10:00")
    const [endTime, setEndTime] = React.useState("11:00")
    const [meetingReason, setMeetingReason] = React.useState("")
    
    // Estados para datos del backend
    const [room, setRoom] = React.useState<Sala | null>(null)
    const [bookings, setBookings] = React.useState<Booking[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [submitting, setSubmitting] = React.useState(false)

    // Función para cargar datos (sala y reservas)
    const loadData = React.useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Cargar sala
            const roomData = await getRoomById(effectiveRoomId)
            setRoom(roomData)
            
            // Cargar todas las reservas
            const allReservas = await getReservas()
            
            // Filtrar y convertir reservas para esta sala
            const filteredBookings = allReservas
                .filter(
                    (r) => String(r.id_sala) === effectiveRoomId && r.estado === true
                )
                .map(convertReservaToBooking)
            
            setBookings(filteredBookings)
        } catch (err) {
            console.error("Error cargando datos:", err)
            setError("Error al cargar la información de la sala")
            setBookings([])
        } finally {
            setLoading(false)
        }
    }, [effectiveRoomId])

    // Cargar sala y reservas al montar el componente
    React.useEffect(() => {
        if (effectiveRoomId) {
            loadData()
        }
    }, [effectiveRoomId, loadData])

    const bookingsForDay = React.useMemo(() => {
        if (!selectedDate) return []
        return bookings
            .filter((booking) =>
                isSameDay(booking.date, selectedDate)
            )
            .sort(
                (a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start)
            )
    }, [selectedDate, bookings])

    const endTimeOptions = React.useMemo(
        () => getAvailableEndTimes(startTime, allTimes),
        [startTime, allTimes]
    )

    React.useEffect(() => {
        const stillValid = endTimeOptions.includes(endTime)
        if (!stillValid) {
            setEndTime(endTimeOptions[0] ?? "")
        }
    }, [startTime, endTime, endTimeOptions])

    const hasConflict = React.useMemo(() => {
        if (!selectedDate || !startTime || !endTime) return true
        if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) return true

        return bookingsForDay.some((booking) =>
            rangesOverlap(startTime, endTime, booking.start, booking.end)
        )
    }, [selectedDate, startTime, endTime, bookingsForDay])

    const agendaItems = React.useMemo(() => {
        return agendaSlots.map((slot) => {
            const busyBooking = bookingsForDay.find((booking) =>
                rangesOverlap(slot.start, slot.end, booking.start, booking.end)
            )

            const overlapsCurrent =
                startTime &&
                endTime &&
                rangesOverlap(slot.start, slot.end, startTime, endTime)

            let status: TimeSlotStatus = "free"

            if (busyBooking) status = "busy"
            if (!busyBooking && overlapsCurrent) status = "current"

            return {
                ...slot,
                status,
                booking: busyBooking,
            }
        })
    }, [agendaSlots, bookingsForDay, startTime, endTime])

    function handleConfirmReservation() {
        if (hasConflict || !selectedDate) return

        const handleSubmit = async () => {
            try {
                setSubmitting(true)

                // Construir la fecha y hora completa
                const startDateTime = new Date(selectedDate)
                const [horaInicio, minInicio] = startTime.split(":")
                startDateTime.setHours(parseInt(horaInicio), parseInt(minInicio))

                const endDateTime = new Date(selectedDate)
                const [horaFin, minFin] = endTime.split(":")
                endDateTime.setHours(parseInt(horaFin), parseInt(minFin))

                // Crear objeto de reserva
                const newReserva: Omit<reserva, "id_reserva" | "fecha_creacion"> = {
                    id_sala: effectiveRoomId,
                    id_usuario: "1", // Por ahora usar ID genérico, en futuro obtener del usuario autenticado
                    hora_inicio: startDateTime,
                    hora_fin: endDateTime,
                    estado: true,
                    motivo: meetingReason.trim() || "Reunión",
                }

                // Enviar reserva al backend
                const result = await createReserva(newReserva)
                
                // Mostrar toast de éxito con información de la reserva
                toast.success("Reserva confirmada exitosamente", {
                    description: `Sala: ${room?.nombre} | ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })} | ${formatHourLabel(startTime)} - ${formatHourLabel(endTime)} | Motivo: ${newReserva.motivo}`,
                })

                console.log("Reserva creada exitosamente:", result)

                // Recargar datos para actualizar los horarios reservados
                await loadData()

                // Aquí podrías cerrar el modal o redirigir
            } catch (err) {
                console.error("Error al crear reserva:", err)
                
                // Mostrar toast de error
                toast.error("No se pudo realizar la reserva", {
                    description: "Intenta de nuevo más tarde.",
                    style: {
                        background: "#EF4444",
                        color: "#ffffff",
                        border: "1px solid #DC2626",
                        fontSize: "14px",
                        fontWeight: "600",
                    },
                })
            } finally {
                setSubmitting(false)
            }
        }

        handleSubmit()
    }

    if (loading) {
        return (
            <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col items-center justify-center">
                <p className="text-lg text-slate-600">Cargando información de la sala...</p>
            </div>
        )
    }

    if (error || !room) {
        return (
            <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col items-center justify-center">
                <p className="text-lg text-red-600">{error || "No se pudo cargar la sala"}</p>
            </div>
        )
    }

    return (
        <div className="w-[95vw] max-w-275 h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="w-full h-16 shrink-0 bg-[#F1F5F9] rounded-t-2xl flex items-center justify-start px-6 py-4 border-b">
                <h1 className="text-2xl font-bold text-slate-900">Reservar Sala {room.nombre}</h1>
            </div>

            {/* Contenido principal */}
            <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.65fr_0.85fr]">
                {/* Columna izquierda */}
                <div className="p-6 border-r bg-white overflow-y-auto min-h-0">
                    <div className="grid grid-cols-1  gap-6">
                        {/* Calendario */}
                        <div className="rounded-2xl border bg-white p-4 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                locale={es}
                                month={selectedDate}
                                onMonthChange={setSelectedDate}
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
                                    day_disabled: "text-slate-300 opacity-50",
                                }}
                            />
                        </div>

                        {/* Formulario */}
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Hora inicio */}
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

                                {/* Hora fin */}
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

                            {/* Estado de validación */}
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

                            {/* Motivo */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Motivo de la reunión{" "}
                                    <span className="font-normal text-slate-400">(opcional)</span>
                                </label>
                                <Textarea
                                    value={meetingReason}
                                    onChange={(e) => setMeetingReason(e.target.value)}
                                    placeholder="Ej. Revisión de proyecto de tesis..."
                                    className="min-h-35 resize-none rounded-xl"
                                />
                            </div>

                            {/* Resumen */}
                            <div className="rounded-2xl border bg-slate-50 p-4">
                                <div className="flex items-center gap-2 mb-2 text-slate-700">
                                    <CalendarIcon className="w-4 h-4" />
                                    <p className="text-sm font-semibold">Resumen de reserva</p>
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
                                        {formatHourLabel(startTime)} - {formatHourLabel(endTime)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-800">Sala:</span> {room.nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna derecha: agenda */}
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
                                const isBusy = item.status === "busy"
                                const isCurrent = item.status === "current"

                                return (
                                    <div key={`${item.start}-${item.end}-${index}`} className="relative">
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
                                                {formatHourLabel(item.start)} - {formatHourLabel(item.end)}
                                            </p>

                                            {item.status === "free" && (
                                                <p className="text-[28px] leading-none text-slate-700 mt-1">Libre</p>
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
                                                    <p className="font-bold text-[#22C55E]">Tu reserva actual</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
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
    )
}