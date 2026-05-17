"use client";

import { useMemo, useState } from "react";
import { Loader2, Monitor, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Resource } from "@/src/entities/recurso";

type RoomResourcesManagerProps = {
    resources: Resource[];
    allResources: Resource[];
    selectedResourceId: string;
    onSelectedResourceChange: (value: string) => void;
    onAddResource: () => void;
    onDeleteResource: (resource: Resource) => Promise<void>;
    saving?: boolean;
    roomName?: string;
    roomId?: string | number;
    pendingAssignedResourceIds?: string[];
};

export function RoomResourcesManager({
    resources,
    allResources,
    selectedResourceId,
    onSelectedResourceChange,
    onAddResource,
    onDeleteResource,
    saving = false,
    roomName,
    roomId,
    pendingAssignedResourceIds = [],
}: RoomResourcesManagerProps) {
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const selectableResources = useMemo(() => {
        return allResources.filter(
            (resource) =>
                !resources.some(
                    (assigned) => String(assigned.id_recurso) === String(resource.id_recurso)
                )
        );
    }, [allResources, resources]);

    const handleConfirmDelete = async () => {
        if (!resourceToDelete) return;

        try {
            setDeletingId(String(resourceToDelete.id_recurso));
            await onDeleteResource(resourceToDelete);

            const wasPending = pendingAssignedResourceIds.includes(
                String(resourceToDelete.id_recurso)
            );

            toast.success(
                wasPending
                    ? "Recurso retirado de la lista."
                    : "Recurso eliminado correctamente."
            );

            setResourceToDelete(null);
        } catch (error) {
            console.error("Error eliminando recurso:", error);
            toast.error("No se pudo eliminar el recurso.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <h2 className="mb-5 text-base font-semibold text-gray-800">
                Recursos Tecnológicos
            </h2>

            <div className="mb-4 space-y-3">
                {resources.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 px-4 py-6 text-sm text-gray-400">
                        Esta sala no tiene recursos asociados.
                    </div>
                ) : (
                    resources.map((resource) => {
                        const isDeleting = deletingId === String(resource.id_recurso);
                        const isPending = pendingAssignedResourceIds.includes(
                            String(resource.id_recurso)
                        );

                        return (
                            <div
                                key={resource.id_recurso}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                                            <Monitor className="h-5 w-5 text-red-400" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {resource.nombre}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {resource.descripcion}
                                            </p>

                                            <div className="mt-2 space-y-1">

                                                <p className="text-[11px] text-gray-400">
                                                    Pertenece a: {roomName || `Sala ${roomId}`}
                                                </p>

                                                <p className="text-[11px] text-gray-400">
                                                    ID sala: {roomId ?? resource.id_sala}
                                                </p>

                                                {isPending && (
                                                    <p className="text-[11px] font-medium text-amber-600">
                                                        Pendiente por guardar
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={saving || isDeleting}
                                        onClick={() => setResourceToDelete(resource)}
                                        className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                    Agregar Recurso
                </p>

                <div className="mb-3">
                    <label className="mb-1 block text-xs text-gray-500">Recurso</label>
                    <select
                        value={selectedResourceId}
                        onChange={(e) => onSelectedResourceChange(e.target.value)}
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
                    >
                        <option value="">Seleccionar recurso</option>
                        {selectableResources.map((resource) => (
                            <option
                                key={resource.id_recurso}
                                value={String(resource.id_recurso)}
                            >
                                {resource.nombre}{" "}
                                {resource.id_sala ? `(Sala actual: ${resource.id_sala})` : "(Sin sala)"}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    onClick={onAddResource}
                    disabled={saving || !selectedResourceId}
                    className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    + Agregar
                </button>
            </div>

            <AlertDialog
                open={!!resourceToDelete}
                onOpenChange={(open) => {
                    if (!open) setResourceToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {resourceToDelete &&
                                pendingAssignedResourceIds.includes(String(resourceToDelete.id_recurso))
                                ? `Este recurso fue agregado en esta edición y todavía no se ha guardado. Si confirmas, solo se quitará de la lista actual.`
                                : `Vas a quitar el recurso "${resourceToDelete?.nombre}" de esta sala inmediatamente.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={!!deletingId}
                        >
                            {deletingId ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}