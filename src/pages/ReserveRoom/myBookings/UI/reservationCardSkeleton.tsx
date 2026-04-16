import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/src/shared/ui/skeleton";


export default function ReservationCardSkeleton() {
    return (
        <Card className="rounded-[22px] border border-[#f0eceb] bg-white shadow-sm">
            <CardContent className="space-y-6 p-8">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-md" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4 rounded-xl" />
                    <Skeleton className="h-6 w-2/3 rounded-xl" />
                    <Skeleton className="h-6 w-1/2 rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>

                <Skeleton className="h-16 w-full rounded-2xl" />
            </CardContent>
        </Card>
    );
}