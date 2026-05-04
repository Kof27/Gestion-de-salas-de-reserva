"use client";

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReservationView } from "../model/reservationView";
import { statusLabel } from "../lib/myBookingLib";

const dotClass: Record<string, string> = {
    active: "bg-red-500",
    past: "bg-slate-300",
    cancelled: "bg-red-200",
};

const badgeClass: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    past: "bg-slate-100 text-slate-500 border-slate-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
};

interface TimelineItemProps {
    reservation: ReservationView;
    onCancel: (id: string) => Promise<void>;
    cancellingId: string | null;
}

export default function TimelineItem({ reservation, onCancel, cancellingId }: TimelineItemProps) {
    const { id, title, location, dateLabel, status, motivo } = reservation;
    const isCancelling = cancellingId === String(id);
    const canCancel = status === "active";

    return (
        <AccordionItem value={String(id)} className="border-0 last:border-0">
            <AccordionTrigger
                className={cn(
                    "px-4 py-3.5 hover:no-underline hover:bg-slate-50 rounded-none transition-colors",
                    "data-[state=open]:bg-slate-50"
                )}
            >
                <div className="flex flex-1 items-center gap-3 min-w-0 mr-3">
                    <span
                        className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full",
                            dotClass[status]
                        )}
                    />
                    <Badge
                        variant="outline"
                        className={cn(
                            "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            badgeClass[status]
                        )}
                    >
                        {statusLabel(status)}
                    </Badge>
                    <span className="truncate text-sm font-semibold text-slate-800">
                        {title}
                    </span>
                    <span className="ml-auto hidden shrink-0 text-xs text-slate-400 sm:block">
                        {dateLabel}
                    </span>
                </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
                <div className="mx-4 mb-3 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                    <p className="block text-xs font-medium text-slate-400 sm:hidden">
                        {dateLabel}
                    </p>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{location}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{motivo}</span>
                    </div>

                    {canCancel && (
                        <div className="pt-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isCancelling}
                                onClick={() => onCancel(String(id))}
                                className="h-8 rounded-lg bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Cancelando...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                        Cancelar reserva
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
