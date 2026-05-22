"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    className?: string;
}

export function FilterSelect({ value, options, onChange, icon, className }: FilterSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

    return (
        <div ref={ref} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
                {icon}
                <span>{selectedLabel}</span>
                <ChevronDown
                    className={cn(
                        "h-3.5 w-3.5 text-slate-400 transition-transform duration-150",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={cn(
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                                value === opt.value
                                    ? "font-semibold text-slate-900"
                                    : "text-slate-600"
                            )}
                        >
                            <Check
                                className={cn(
                                    "h-3.5 w-3.5 shrink-0 text-red-500",
                                    value === opt.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
