"use client";

import { useMemo, useState } from "react";
import {
    ArrowLeft,
    Monitor,
    Video,
    Snowflake,
    Trash2,
    PlusCircle,
    ChevronDown,
} from "lucide-react";

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

import {
    availableResources,
    defaultFaculty,
    type ResourceCatalogItem,
    type RoomResourceItem,
    saveRoomMock,
} from "@/src/pages/rooms/api/mocksAPI";

const iconMap = {
    monitor: Monitor,
    video: Video,
    snowflake: Snowflake,
};

function NewRoomPage() {
    const [roomName, setRoomName] = useState("");
    const [location, setLocation] = useState("");
    const [faculty] = useState(defaultFaculty);
    const [capacity, setCapacity] = useState<number[]>([20]);

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

    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const selectedResource = useMemo(
        () => availableResources.find((item) => item.id === selectedResourceId),
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
        setResources((prev) => prev.filter((resource) => resource.id !== id));
    };

    const handleSubmit = () => {
        const payload = {
            name: roomName,
            location,
            faculty,
            capacity: capacity[0],
            resources,
        };

        saveRoomMock(payload);
        console.log("Sala registrada en mock:", payload);
    };

    return (
        <main className="min-h-screen bg-[#faf8f8] px-4 py-10 md:px-8">
            <div className="mx-auto max-w-4xl">
                <Card className="rounded-3xl border border-[#efe8e8] bg-white shadow-sm">
                    <CardContent className="p-6 md:p-10">
                        <div className="mb-8 flex items-start gap-3">
                            <button
                                type="button"
                                className="mt-1 text-[#9b6b6b] transition hover:text-[#7c4f4f]"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-[#2b2323] md:text-5xl">
                                    Crear Nueva Sala
                                </h1>
                                <p className="mt-2 text-sm text-[#b78d8d] md:text-base">
                                    Agregar un nuevo espacio para la Facultad de Ingeniería.
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 border-t border-[#f1eaea]" />

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="room-name"
                                    className="text-base font-semibold text-[#2f2525]"
                                >
                                    Nombre de la Sala <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="room-name"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="ej. Sala de Juntas 1"
                                    className="h-12 rounded-xl border-[#ead6d6] bg-white text-base placeholder:text-[#d2b2b2] focus-visible:ring-[#ef4444]/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="text-base font-semibold text-[#2f2525]"
                                >
                                    Ubicación <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="ej. Edificio Central, Piso 2"
                                    className="h-12 rounded-xl border-[#ead6d6] bg-white text-base placeholder:text-[#d2b2b2] focus-visible:ring-[#ef4444]/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base font-semibold text-[#2f2525]">
                                    Facultad
                                </Label>
                                <Input
                                    value={faculty}
                                    disabled
                                    className="h-12 rounded-xl border-[#efe6e6] bg-[#f8f2f2] text-base text-[#c79f9f] disabled:opacity-100"
                                />
                                <p className="text-sm text-[#d1aaaa]">
                                    Asignado automáticamente a su facultad.
                                </p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold text-[#2f2525]">
                                        Capacidad (2-100 personas){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <span className="text-3xl font-bold text-[#ff1f1f]">
                    {capacity[0]}
                  </span>
                                </div>

                                <Slider
                                    value={capacity}
                                    min={2}
                                    max={100}
                                    step={1}
                                    onValueChange={setCapacity}
                                    className="[&_[role=slider]]:border-0 [&_[role=slider]]:bg-[#ff1f1f] [&_[role=slider]]:shadow-none"
                                />
                            </div>

                            <div className="pt-3">
                                <h2 className="mb-4 text-2xl font-bold text-[#1f2937]">
                                    Recursos Tecnológicos
                                </h2>

                                <div className="rounded-2xl border border-[#e8edf3] bg-[#fbfdff] p-4">
                                    <div className="space-y-3">
                                        {resources.map((resource) => {
                                            const Icon = iconMap[resource.icon];

                                            return (
                                                <div
                                                    key={resource.id}
                                                    className="flex items-center justify-between rounded-xl border border-[#eef2f6] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff1f1] text-[#ff3b30]">
                                                            <Icon className="h-5 w-5" />
                                                        </div>

                                                        <div>
                                                            <p className="text-xl font-semibold text-[#1f2937]">
                                                                {resource.name}
                                                            </p>
                                                            <p className="text-sm text-[#94a3b8]">
                                                                {resource.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                            <span className="text-lg font-medium text-[#334155]">
                              Cant: {resource.quantity}
                            </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveResource(resource.id)}
                                                            className="text-[#94a3b8] transition hover:text-red-500"
                                                            aria-label={`Eliminar ${resource.name}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-dashed border-[#d7e0ea] bg-[#fcfcfd] p-5">
                                    <h3 className="mb-4 text-xl font-semibold text-[#1f2937]">
                                        Agregar Recurso
                                    </h3>

                                    <div className="grid gap-4 md:grid-cols-[1fr_120px_140px] md:items-end">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-[#475569]">
                                                Recurso
                                            </Label>
                                            <Select
                                                value={selectedResourceId}
                                                onValueChange={setSelectedResourceId}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-[#d7dfea] text-base">
                                                    <SelectValue placeholder="Seleccionar recursos" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableResources.map((resource) => (
                                                        <SelectItem key={resource.id} value={resource.id}>
                                                            {resource.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="quantity"
                                                className="text-sm font-medium text-[#475569]"
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
                                                className="h-12 rounded-xl border-[#d7dfea] text-center text-base"
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleAddResource}
                                            className="h-12 rounded-xl bg-white px-5 text-base font-semibold text-[#1f2937] shadow-none border border-[#d7dfea] hover:bg-[#f8fafc]"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 border-t border-[#f1eaea] pt-8">
                                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-14 min-w-[220px] rounded-2xl border-[#ead2d2] bg-white text-lg font-semibold text-[#7b5b5b] hover:bg-[#fffafa]"
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="h-14 min-w-[260px] rounded-2xl bg-[#ff1616] text-lg font-semibold text-white hover:bg-[#e81313]"
                                    >
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        Registrar Sala
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export {NewRoomPage}