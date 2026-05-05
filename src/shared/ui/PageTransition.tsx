"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out">
            {children}
        </div>
    );
}
