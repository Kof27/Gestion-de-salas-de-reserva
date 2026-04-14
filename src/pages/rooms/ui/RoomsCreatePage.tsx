"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { createRoom } from "@/src/shared/api/getRooms";
import { getResources } from "@/src/shared/api/getRecursos";
import { RoomResourcesManager } from "@/src/widgets/room_resource/roomResource";

import type { Sala } from "@/src/entities/room";
import type { Resource } from "@/src/entities/recurso";

export function NewRoomPage() {
    const [roomName, setRoomName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [faculty] = useState("Facultad de Ingeniería");
    const [capacity, setCapacity] = useState<number[]>([20]);

    const [resources, setResources] = useState<Resource[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [pendingAssignedResourceIds, setPendingAssignedResourceIds] = useState<string[]>([]);

    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadResources = useCallback(async () => {
        try {
            setLoadingResources(true);
            const backendResources = await getResources();
            setAllResources(backendResources);
        } catch (error) {
            console.error("Error cargando recursos:", error);
            toast.error("No se pudieron cargar los recursos disponibles.");
        } finally {
            setLoadingResources(false);
        }
    }, []);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    const handleAddResource = () => {
        if (!selectedResourceId) return;

        const selected = allResources.find(
            (resource) => String(resource.id_recurso) === selectedResourceId
        );

        if (!selected) return;

        const alreadyAssigned = resources.some(
            (resource) => String(resource.id_recurso) === selectedResourceId
        );

        if (alreadyAssigned) {
            toast.error("Ese recurso ya está agregado a la nueva sala.");
            return;
        }

        const localResource: Resource = {
            ...selected,
            id_sala: 0,
        };

        setResources((prev) => [...prev, localResource]);
        setPendingAssignedResourceIds((prev) =>
            prev.includes(selectedResourceId) ? prev : [...prev, selectedResourceId]
        );
        setSelectedResourceId("");
    };

    const handleDeleteResource = async (resource: Resource) => {
        const resourceId = String(resource.id_recurso);

        setResources((prev) =>
            prev.filter((item) => String(item.id_recurso) !== resourceId)
        );

        setPendingAssignedResourceIds((prev) =>
            prev.filter((id) => id !== resourceId)
        );
    };

    const handleSubmit = async () => {
        if (!roomName.trim() || !location.trim() || !description.trim()) {
            toast.error("Completa los campos obligatorios.");
            return;
        }

        try {
            setSubmitting(true);

            const payload: Omit<Sala, "id_sala"> = {
                id_facultad: 1,
                capacidad: capacity[0],
                estado: true,
                fecha_creacion: new Date().toISOString(),
                imagen_sala:
                    imageUrl.trim() ||
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                nombre: roomName.trim(),
                ubicacion: location.trim(),
                descripcion: description.trim(),
            };

            const result = await createRoom(payload);

            toast.success("Sala creada correctamente", {
                description: `Se registró ${result.nombre}.`,
            });

            setRoomName("");
            setLocation("");
            setDescription("");
            setImageUrl("");
            setCapacity([20]);
            setSelectedResourceId("");
            setResources([]);
            setPendingAssignedResourceIds([]);
        } catch (error) {
            console.error("Error creando sala:", error);
            toast.error("No se pudo crear la sala.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-4xl">
                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Crear Nueva Sala
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Agregar un nuevo espacio para la Facultad de Ingeniería.
                            </p>
                        </div>

                        <div className="mb-6 border-t border-gray-100" />

                        <div className="grid grid-cols-2 gap-10">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-base font-semibold text-gray-800">
                                    Detalles de la Sala
                                </h2>

                                <div>
                                    <Label
                                        htmlFor="room-name"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Nombre <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="room-name"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="ej. Sala de Juntas 1"
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="location"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Ubicación <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="ej. Edificio Central, Piso 2"
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="description"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Descripción <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe brevemente la sala"
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label
                                        htmlFor="imageUrl"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        URL de imagen
                                    </Label>
                                    <Input
                                        id="imageUrl"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Facultad
                                    </Label>
                                    <Input
                                        value={faculty}
                                        disabled
                                        className="h-10 rounded-lg border-gray-100 bg-gray-50 text-sm text-gray-400 disabled:opacity-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Asignado automáticamente a su facultad.
                                    </p>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Capacidad (2-100) <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-xl font-bold text-red-500">
                                            {capacity[0]}
                                        </span>
                                    </div>
                                    <Slider
                                        value={capacity}
                                        min={2}
                                        max={100}
                                        step={1}
                                        onValueChange={setCapacity}
                                        className="**:[[role=slider]]:border-0 **:[[role=slider]]:bg-red-500 **:[[role=slider]]:shadow-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <RoomResourcesManager
                                    resources={resources}
                                    allResources={allResources}
                                    selectedResourceId={selectedResourceId}
                                    onSelectedResourceChange={setSelectedResourceId}
                                    onAddResource={handleAddResource}
                                    onDeleteResource={handleDeleteResource}
                                    saving={submitting || loadingResources}
                                    roomName={roomName || "Nueva sala"}
                                    roomId="nueva"
                                    pendingAssignedResourceIds={pendingAssignedResourceIds}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                            <button
                                type="button"
                                className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <PlusCircle className="h-4 w-4" />
                                {submitting ? "Registrando..." : "Registrar Sala"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default NewRoomPage;