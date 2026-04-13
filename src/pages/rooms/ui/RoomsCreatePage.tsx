"use client";

import { useMemo, useState } from "react";
import { Monitor, Video, Snowflake, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    availableResources,
    defaultFaculty,
    type ResourceCatalogItem,
    type RoomResourceItem,
    saveRoomMock,
} from "@/src/lib/rooms/mocksAPI";

const iconMap = { monitor: Monitor, video: Video, snowflake: Snowflake };

export function NewRoomPage() {
    const [roomName,    setRoomName]    = useState("");
    const [location,    setLocation]    = useState("");
    const [faculty]                     = useState(defaultFaculty);
    const [capacity,    setCapacity]    = useState<number[]>([20]);
    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [selectedQuantity,   setSelectedQuantity]   = useState(1);

    const [resources, setResources] = useState<RoomResourceItem[]>([
        { id: "pantalla-interactiva-65",        name: 'Pantalla Interactiva 65"',    description: "Pantalla táctil",       quantity: 1, icon: "monitor"   },
        { id: "videoconferencia-logitech-meetup", name: "Sistema de Videoconferencia", description: "Logitech MeetUp",       quantity: 1, icon: "video"     },
        { id: "aire-acondicionado",             name: "Aire Acondicionado",           description: "Control independiente", quantity: 1, icon: "snowflake" },
    ]);

    const selectedResource = useMemo(
        () => availableResources.find(r => r.id === selectedResourceId),
        [selectedResourceId]
    );

    const handleAddResource = () => {
        if (!selectedResource) return;
        setResources(prev => {
            const existing = prev.find(r => r.id === selectedResource.id);
            if (existing) return prev.map(r => r.id === selectedResource.id ? { ...r, quantity: r.quantity + selectedQuantity } : r);
            return [...prev, { id: selectedResource.id, name: selectedResource.name, description: selectedResource.description, quantity: selectedQuantity, icon: selectedResource.icon }];
        });
        setSelectedResourceId("");
        setSelectedQuantity(1);
    };

    const handleRemoveResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));

    const handleSubmit = () => {
        const payload = { name: roomName, location, faculty, capacity: capacity[0], resources };
        saveRoomMock(payload);
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-4xl">
                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-8">

                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Sala</h1>
                            <p className="mt-1 text-sm text-gray-400">Agregar un nuevo espacio para la Facultad de Ingeniería.</p>
                        </div>

                        <div className="mb-6 border-t border-gray-100" />

                        {/* Dos columnas */}
                        <div className="grid grid-cols-2 gap-10">

                            {/* Columna izquierda — Detalles */}
                            <div className="flex flex-col gap-4">
                                <h2 className="text-base font-semibold text-gray-800">Detalles de la Sala</h2>

                                <div>
                                    <Label htmlFor="room-name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Nombre <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="room-name"
                                        value={roomName}
                                        onChange={e => setRoomName(e.target.value)}
                                        placeholder="ej. Sala de Juntas 1"
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Ubicación <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="ej. Edificio Central, Piso 2"
                                        className="h-10 rounded-lg border-gray-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Facultad</Label>
                                    <Input
                                        value={faculty}
                                        disabled
                                        className="h-10 rounded-lg border-gray-100 bg-gray-50 text-sm text-gray-400 disabled:opacity-100"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Asignado automáticamente a su facultad.</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Capacidad (2-100) <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-xl font-bold text-red-500">{capacity[0]}</span>
                                    </div>
                                    <Slider
                                        value={capacity}
                                        min={2} max={100} step={1}
                                        onValueChange={setCapacity}
                                        className="[&_[role=slider]]:border-0 [&_[role=slider]]:bg-red-500 [&_[role=slider]]:shadow-none"
                                    />
                                </div>
                            </div>

                            {/* Columna derecha — Recursos */}
                            <div>
                                <h2 className="text-base font-semibold text-gray-800 mb-4">Recursos Tecnológicos</h2>

                                {/* Lista de recursos */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                    {resources.map((resource, index) => {
                                        const Icon = iconMap[resource.icon];
                                        return (
                                            <div
                                                key={resource.id}
                                                className={`flex items-center justify-between px-4 py-3 ${index !== resources.length - 1 ? 'border-b border-gray-100' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                                                        <Icon className="w-4 h-4 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{resource.name}</p>
                                                        <p className="text-xs text-gray-400">{resource.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">Cant: {resource.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveResource(resource.id)}
                                                        className="text-gray-300 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Agregar recurso */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-gray-800 mb-3">Agregar Recurso</p>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Recurso</Label>
                                            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                                                <SelectTrigger className="h-9 rounded-lg border-gray-200 text-sm">
                                                    <SelectValue placeholder="Seleccionar recurso" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableResources.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="quantity" className="text-xs text-gray-500 mb-1 block">Cantidad</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                min={1}
                                                value={selectedQuantity}
                                                onChange={e => setSelectedQuantity(Number(e.target.value) || 1)}
                                                className="h-9 rounded-lg border-gray-200 text-sm text-center"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddResource}
                                        className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Registrar Sala
                            </button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


export default NewRoomPage
