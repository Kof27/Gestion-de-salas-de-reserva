export default function EditRoomSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-6 py-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mb-2 h-8 w-72 animate-pulse rounded bg-gray-200" />
                    <div className="mb-8 h-4 w-96 animate-pulse rounded bg-gray-100" />

                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-28 w-full animate-pulse rounded bg-gray-100" />
                        </div>

                        <div className="space-y-4">
                            <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />
                            <div className="h-56 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-32 w-full animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                        <div className="h-10 w-28 animate-pulse rounded bg-gray-100" />
                        <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}