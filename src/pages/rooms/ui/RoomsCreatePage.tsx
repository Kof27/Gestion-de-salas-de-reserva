"use client";

import { useMemo, useState } from "react";
import { Monitor, Video, Snowflake, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createRoom } from "@/src/shared/api/getRooms";
import type { Sala } from "@/src/entities/room";
import {
    availableResources,
    defaultFaculty,
    type ResourceCatalogItem,
    type RoomResourceItem,
} from "@/src/pages/rooms/api/mockAPI";

const iconMap = {
    monitor: Monitor,
    video: Video,
    snowflake: Snowflake,
};

export function NewRoomPage() {
    const [roomName, setRoomName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [faculty] = useState(defaultFaculty);
    const [capacity, setCapacity] = useState<number[]>([20]);
    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const [resources, setResources] = useState<RoomResourceItem[]>([
        {
            id: "pantalla-interactiva-65",
            name: 'Pantalla Interactiva 65"',
            description: "Pantalla táctil",
            quantity: 1,
            icon: "monitor",
        },
        {
            id: "videoconferencia-logitech-meetup",
            name: "Sistema de Videoconferencia",
            description: "Logitech MeetUp",
            quantity: 1,
            icon: "video",
        },
        {
            id: "aire-acondicionado",
            name: "Aire Acondicionado",
            description: "Control independiente",
            quantity: 1,
            icon: "snowflake",
        },
    ]);

    const selectedResource = useMemo(
        () => availableResources.find((r) => r.id === selectedResourceId),
        [selectedResourceId]
    );

    const handleAddResource = () => {
        if (!selectedResource) return;

        setResources((prev) => {
            const existing = prev.find((r) => r.id === selectedResource.id);

            if (existing) {
                return prev.map((r) =>
                    r.id === selectedResource.id
                        ? { ...r, quantity: r.quantity + selectedQuantity }
                        : r
                );
            }

            return [
                ...prev,
                {
                    id: selectedResource.id,
                    name: selectedResource.name,
                    description: selectedResource.description,
                    quantity: selectedQuantity,
                    icon: selectedResource.icon,
                },
            ];
        });

        setSelectedResourceId("");
        setSelectedQuantity(1);
    };

    const handleRemoveResource = (id: string) => {
        setResources((prev) => prev.filter((r) => r.id !== id));
    };

    const handleSubmit = async () => {
        if (!roomName.trim() || !location.trim() || !description.trim()) {
            toast.error("Completa los campos obligatorios.");
            return;
        }

        try {
            setSubmitting(true);

            const payload: Omit<Sala, "id_sala"> = {
                id_facultad: Number(faculty) || 1,
                capacidad: capacity[0],
                estado: true,
                fecha_creacion: new Date().toISOString(),
                imagen_sala:
                    imageUrl.trim() ||
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                nombre: roomName.trim(),
                ubicacion: location.trim(),
                descripcion: description.trim(),
                recursosTecnologico: resources.map(
                    (resource) => `${resource.name} x${resource.quantity}`
                ),
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
            setSelectedQuantity(1);
            setResources([
                {
                    id: "pantalla-interactiva-65",
                    name: 'Pantalla Interactiva 65"',
                    description: "Pantalla táctil",
                    quantity: 1,
                    icon: "monitor",
                },
                {
                    id: "videoconferencia-logitech-meetup",
                    name: "Sistema de Videoconferencia",
                    description: "Logitech MeetUp",
                    quantity: 1,
                    icon: "video",
                },
                {
                    id: "aire-acondicionado",
                    name: "Aire Acondicionado",
                    description: "Control independiente",
                    quantity: 1,
                    icon: "snowflake",
                },
            ]);
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
                                <h2 className="mb-4 text-base font-semibold text-gray-800">
                                    Recursos Tecnológicos
                                </h2>

                                <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                                    {resources.map((resource, index) => {
                                        const Icon =
                                            iconMap[resource.icon as keyof typeof iconMap];

                                        return (
                                            <div
                                                key={resource.id}
                                                className={`flex items-center justify-between px-4 py-3 ${index !== resources.length - 1
                                                    ? "border-b border-gray-100"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                                                        <Icon className="h-4 w-4 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {resource.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {resource.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">
                                                        Cant: {resource.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveResource(resource.id)
                                                        }
                                                        className="text-gray-300 transition-colors hover:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-3 text-sm font-semibold text-gray-800">
                                        Agregar Recurso
                                    </p>
                                    <div className="mb-2 grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="mb-1 block text-xs text-gray-500">
                                                Recurso
                                            </Label>
                                            <Select
                                                value={selectedResourceId}
                                                onValueChange={setSelectedResourceId}
                                            >
                                                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                                                    <SelectValue placeholder="Seleccionar recurso" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableResources.map((r) => (
                                                        <SelectItem key={r.id} value={r.id}>
                                                            {r.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="quantity"
                                                className="mb-1 block text-xs text-gray-500"
                                            >
                                                Cantidad
                                            </Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                min={1}
                                                value={selectedQuantity}
                                                onChange={(e) =>
                                                    setSelectedQuantity(Number(e.target.value) || 1)
                                                }
                                                className="h-9 rounded-lg border-gray-200 text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddResource}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        Agregar
                                    </button>
                                </div>
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


export default NewRoomPage
