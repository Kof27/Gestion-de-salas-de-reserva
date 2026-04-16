export default function SummaryBox({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex h-28 w-36 flex-col items-center justify-center rounded-[18px] bg-[#f7f3f2] text-center">
            <span className="text-5xl font-extrabold tracking-[-0.04em] text-[#c9141a]">
                {value}
            </span>
            <span className="mt-1 text-lg font-bold tracking-[0.12em] text-[#6a514c]">
                {label}
            </span>
        </div>
    );
}