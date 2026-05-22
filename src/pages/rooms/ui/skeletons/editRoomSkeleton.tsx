export default function EditRoomSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mb-2 h-8 w-56 animate-pulse rounded bg-gray-200 sm:w-72" />
                    <div className="mb-8 h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
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

                    <div className="mt-8 flex flex-col-reverse justify-end gap-2 border-t border-gray-100 pt-6 sm:flex-row sm:gap-3">
                        <div className="h-10 w-full animate-pulse rounded bg-gray-100 sm:w-28" />
                        <div className="h-10 w-full animate-pulse rounded bg-gray-200 sm:w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}