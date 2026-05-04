import { Card, CardContent } from "@/components/ui/card";

export default function CreateRoomSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-4xl">
                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
                            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
                        </div>

                        <div className="mb-6 border-t border-gray-100" />

                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-12 w-full animate-pulse rounded bg-gray-100" />
                            </div>

                            <div className="space-y-4">
                                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                                <div className="h-56 w-full animate-pulse rounded bg-gray-100" />
                                <div className="h-36 w-full animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                            <div className="h-10 w-28 animate-pulse rounded bg-gray-100" />
                            <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}