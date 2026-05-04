import { Card, CardContent } from "@/components/ui/card";
import { ReservationView } from "../model/reservationView";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    Loader2,
    MapPin,
    Monitor,
    XCircle,
} from "lucide-react";
import { statusLabel } from "../lib/myBookingLib";
import { Button } from "@/components/ui/button";

export default function ReservationCard({
    reservation,
    onCancel,
    cancellingId,
}: {
    reservation: ReservationView;
    onCancel: (id: string) => Promise<void>;
    cancellingId: string | null;
}) {
    const isCancelled = reservation.status === "cancelled";
    const isPast = reservation.status === "past";
    const isActive = reservation.status === "active";
    const isCancelling = cancellingId === reservation.id;

    return (
        <Card className="rounded-[22px] border border-[#f0eceb] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <Badge
                        className={cn(
                            "rounded-full border-0 px-4 py-1.5 text-[13px] font-bold tracking-tight shadow-none",
                            isActive && "bg-[#e6efe5] text-[#cf1018]",
                            isPast && "bg-[#f1efee] text-[#6b5a57]",
                            isCancelled && "bg-[#fde8e8] text-[#b91c1c]"
                        )}
                    >
                        <span
                            className={cn(
                                "mr-2 inline-block h-2.5 w-2.5 rounded-full",
                                isActive && "bg-[#cf1018]",
                                isPast && "bg-[#9a8a86]",
                                isCancelled && "bg-[#b91c1c]"
                            )}
                        />
                        {statusLabel(reservation.status)}
                    </Badge>

                    <Monitor
                        className={cn(
                            "mt-0.5 h-5 w-5",
                            isActive && "text-[#e2b5af]",
                            isPast && "text-[#c9b7b3]",
                            isCancelled && "text-[#e48d8d]"
                        )}
                    />
                </div>

                <div className="space-y-5">
                    <div>
                        <h3 className="text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#2d1715] sm:text-[2.1rem]">
                            {reservation.title}
                        </h3>
                    </div>

                    <div className="space-y-3 text-[#6b4c48]">
                        <div className="flex items-center gap-3 text-[1.15rem]">
                            <MapPin className="h-5 w-5 shrink-0" />
                            <span>{reservation.location}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[1.15rem]">
                            <CalendarDays className="h-5 w-5 shrink-0" />
                            <span>{reservation.dateLabel}</span>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Motivo:</span>{" "}
                            {reservation.motivo}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        variant="ghost"
                        disabled={isCancelled || isCancelling || isPast}
                        onClick={() => onCancel(reservation.id)}
                        className={cn(
                            "h-16 w-full rounded-2xl text-[1.15rem] font-bold",
                            isCancelled
                                ? "cursor-not-allowed bg-[#f3f0ef] text-[#9a8a86] hover:bg-[#f3f0ef] opacity-70"
                                : isPast
                                    ? "cursor-not-allowed bg-[#f7ece8] text-[#8d5b55] hover:bg-[#f7ece8] opacity-80"
                                    : "bg-[#f8ddd9] text-[#d11318] hover:bg-[#f4d1cc]"
                        )}
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelando...
                            </>
                        ) : isCancelled ? (
                            <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reserva cancelada
                            </>
                        ) : isPast ? (
                            "Reserva finalizada"
                        ) : (
                            "Cancelar Reserva"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}