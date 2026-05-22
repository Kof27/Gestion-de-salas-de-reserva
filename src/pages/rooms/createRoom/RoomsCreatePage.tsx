"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { createRoom, getRooms } from "@/src/shared/api/getRooms";
import { getResources, updateResource } from "@/src/shared/api/getRecursos";
import { RoomResourcesManager } from "@/src/widgets/room_resource/roomResource";
import Navbar2 from "@/src/widgets/navbar2/ui/Navbar2";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";
import CreateRoomSkeleton from "../ui/skeletons/createRoomSkeleton";

import type { Sala } from "@/src/entities/room";
import type { Resource } from "@/src/entities/recurso";

type UsuarioSesion = {
    id_usuario?: number | string;
    id_facultad?: number | string;
    id_rol?: number | string;
    nombre?: string;
    correo?: string;
};

function getUsuarioFromLocalStorage(): UsuarioSesion {
    if (typeof window === "undefined") return {};

    try {
        return JSON.parse(localStorage.getItem("usuario") || "{}") as UsuarioSesion;
    } catch (error) {
        console.error("Error leyendo usuario desde localStorage:", error);
        return {};
    }
}

function normalizeText(value: string) {
    return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeLocation(value: string) {
    return normalizeText(value);
}

export function NewRoomPage() {
    const router = useRouter();

    const [existingLocations, setExistingLocations] = useState<string[]>([]);
    const [existingRoomNames, setExistingRoomNames] = useState<string[]>([]);
    const [usuario, setUsuario] = useState<UsuarioSesion>({});

    const [roomName, setRoomName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [capacity, setCapacity] = useState<number[]>([20]);

    const [resources, setResources] = useState<Resource[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [selectedResourceId, setSelectedResourceId] = useState("");
    const [pendingAssignedResourceIds, setPendingAssignedResourceIds] = useState<string[]>([]);

    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [aula, setAula] = useState("1");
    const [piso, setPiso] = useState("1");
    const [salon, setSalon] = useState("");

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const faculty = usuario.id_facultad
        ? String(usuario.id_facultad)
        : "Facultad";

    const buildUbicacion = () => `A${aula}. Salón ${aula}${piso}${salon.trim()}`;

    const hasNameConflict = useMemo(() => {
        if (!roomName.trim()) return false;

        return existingRoomNames.includes(normalizeText(roomName));
    }, [existingRoomNames, roomName]);

    const hasLocationConflict = useMemo(() => {
        if (!salon.trim()) return false;

        return existingLocations.includes(normalizeLocation(buildUbicacion()));
    }, [existingLocations, aula, piso, salon]);

    const isRoomNameInvalid = submitAttempted && !roomName.trim();
    const isRoomNameDuplicate = hasNameConflict;
    const isSalonInvalid = submitAttempted && !salon.trim();
    const isDescriptionInvalid = submitAttempted && !description.trim();
    const isLocationInvalid = submitAttempted && hasLocationConflict;

    const isFormValid =
        roomName.trim() &&
        salon.trim() &&
        description.trim() &&
        !hasNameConflict &&
        !hasLocationConflict;

    const requiredInputClass = (hasError: boolean) =>
        `h-10 rounded-lg text-sm ${hasError
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-gray-200"
        }`;

    const requiredSelectClass = (hasError: boolean) =>
        `h-10 rounded-lg border px-3 text-sm ${hasError
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-gray-200"
        }`;

    const loadInitialData = useCallback(async () => {
        try {
            setLoadingResources(true);

            const currentUser = getUsuarioFromLocalStorage();
            setUsuario(currentUser);

            const [backendResources, backendRooms] = await Promise.all([
                getResources(),
                getRooms(),
            ]);

            const locations = backendRooms
                .map((room) => normalizeLocation(room.ubicacion || ""))
                .filter(Boolean);

            const roomNames = backendRooms
                .filter((room) => {
                    if (!currentUser.id_facultad) return false;

                    return String(room.id_facultad) === String(currentUser.id_facultad);
                })
                .map((room) => normalizeText(room.nombre || ""))
                .filter(Boolean);

            setExistingLocations(locations);
            setExistingRoomNames(roomNames);
            setAllResources(backendResources);
        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
            toast.error("No se pudieron cargar los datos iniciales.");
        } finally {
            setLoadingResources(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        setLocation(buildUbicacion());
    }, [aula, piso, salon]);

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
            prev.includes(selectedResourceId)
                ? prev
                : [...prev, selectedResourceId]
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
        setSubmitAttempted(true);

        if (hasNameConflict) {
            toast.error("No se puede crear la sala", {
                description: "Ya existe una sala con este nombre.",
            });
            return;
        }

        if (hasLocationConflict) {
            toast.error("No se puede crear la sala", {
                description: "Ya existe una sala en esta ubicación.",
            });
            return;
        }

        if (!isFormValid) {
            return;
        }

        if (!usuario.id_facultad) {
            toast.error("No se pudo identificar la facultad del usuario.");
            return;
        }

        try {
            setSubmitting(true);

            const payload: Omit<Sala, "id_sala" | "estado"> = {
                id_facultad: Number(usuario.id_facultad),
                capacidad: capacity[0],

                fecha_creacion: new Date().toISOString(),
                imagen_sala:
                    imageUrl.trim() ||
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                nombre: roomName.trim(),
                ubicacion: buildUbicacion(),
                descripcion: description.trim(),
            };

            const result = await createRoom(payload);

            const newRoomId = Number(result.id_sala);

            if (!newRoomId) {
                throw new Error("La respuesta del servidor no trajo un id_sala válido.");
            }

            if (resources.length > 0) {
                await Promise.all(
                    resources.map((resource) =>
                        updateResource(String(resource.id_recurso), {
                            id_sala: newRoomId,
                            nombre: resource.nombre,
                            descripcion: resource.descripcion,
                        })
                    )
                );
            }

            toast.success("Sala creada correctamente", {
                description: `Se registró ${result.nombre} y se asignaron sus recursos.`,
            });

            await loadInitialData();

            setRoomName("");
            setLocation("");
            setDescription("");
            setImageUrl("");
            setCapacity([20]);
            setSelectedResourceId("");
            setResources([]);
            setPendingAssignedResourceIds([]);
            setAula("1");
            setPiso("1");
            setSalon("");
            setSubmitAttempted(false);
        } catch (error) {
            console.error("Error creando sala y asignando recursos:", error);
            toast.error("No se pudo crear la sala con sus recursos.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitting) {
        return <CreateRoomSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar2 />
            <Sidebar alwaysDrawer />

            <main className="px-3 py-4 sm:px-4 sm:py-8 md:px-8">
            <div className="mx-auto max-w-4xl">
                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                Crear Nueva Sala
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Agregar un nuevo espacio tu facultad.
                            </p>
                        </div>

                        <div className="mb-6 border-t border-gray-100" />

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
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
                                        className={requiredInputClass(
                                            isRoomNameInvalid || isRoomNameDuplicate
                                        )}
                                    />

                                    {isRoomNameInvalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            El nombre de la sala es obligatorio.
                                        </p>
                                    )}

                                    {!isRoomNameInvalid && isRoomNameDuplicate && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            Ya existe una sala con este nombre.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label
                                        htmlFor="location"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Ubicación <span className="text-red-500">*</span>
                                    </Label>

                                    <div className="grid grid-cols-3 gap-2">
                                        <select
                                            value={aula}
                                            onChange={(e) => setAula(e.target.value)}
                                            className={requiredSelectClass(false)}
                                        >
                                            <option value="1">Aula 1</option>
                                            <option value="2">Aula 2</option>
                                            <option value="3">Aula 3</option>
                                            <option value="4">Aula 4</option>
                                        </select>

                                        <select
                                            value={piso}
                                            onChange={(e) => setPiso(e.target.value)}
                                            className={requiredSelectClass(false)}
                                        >
                                            <option value="1">Piso 1</option>
                                            <option value="2">Piso 2</option>
                                            <option value="3">Piso 3</option>
                                            <option value="4">Piso 4</option>
                                        </select>

                                        <Input
                                            id="location"
                                            value={salon}
                                            onChange={(e) =>
                                                setSalon(e.target.value.replace(/\D/g, ""))
                                            }
                                            placeholder="Salón"
                                            className={requiredInputClass(
                                                isSalonInvalid || isLocationInvalid
                                            )}
                                        />
                                    </div>

                                    {isSalonInvalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            El número del salón es obligatorio.
                                        </p>
                                    )}

                                    <Input
                                        value={location}
                                        readOnly
                                        className={`mt-2 h-10 rounded-lg bg-gray-50 text-sm ${hasLocationConflict
                                            ? "border-red-500 text-red-600 focus-visible:ring-red-500"
                                            : "border-gray-200 text-gray-500"
                                            }`}
                                    />

                                    {hasLocationConflict && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            Ya existe una sala en esta ubicación.
                                        </p>
                                    )}
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
                                        className={requiredInputClass(isDescriptionInvalid)}
                                    />

                                    {isDescriptionInvalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            La descripción es obligatoria.
                                        </p>
                                    )}
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
                                            Capacidad (2-100){" "}
                                            <span className="text-red-500">*</span>
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

                        <div className="mt-8 flex flex-col-reverse justify-end gap-2 border-t border-gray-100 pt-6 sm:flex-row sm:gap-3">
                            <button
                                type="button"
                                className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                onClick={() => router.push("/salas")}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={
                                    submitting ||
                                    loadingResources ||
                                    hasLocationConflict ||
                                    hasNameConflict
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Registrar Sala
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </main>
        </div>
    );
}

export default NewRoomPage;