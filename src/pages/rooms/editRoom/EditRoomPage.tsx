"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import Navbar2 from "@/src/widgets/navbar2/ui/Navbar2";
import { getRoomById, getRooms, updateRoom } from "@/src/shared/api/getRooms";
import { getResources, updateResource } from "@/src/shared/api/getRecursos";
import { RoomResourcesManager } from "@/src/widgets/room_resource/roomResource";
import EditRoomSkeleton from "../ui/skeletons/editRoomSkeleton";

import type { Sala } from "@/src/entities/room";
import type { Resource } from "@/src/entities/recurso";

function normalizeLocation(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [roomData, setRoomData] = useState<Sala | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [description, setDescription] = useState("");

  const [aula, setAula] = useState("1");
  const [piso, setPiso] = useState("1");
  const [salon, setSalon] = useState("");

  const [resources, setResources] = useState<Resource[]>([]);
  const [originalResources, setOriginalResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");

  const [pendingAssignedResourceIds, setPendingAssignedResourceIds] = useState<string[]>([]);
  const [existingLocations, setExistingLocations] = useState<string[]>([]);
  const [existingRoomNames, setExistingRoomNames] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const buildUbicacion = () => `A${aula}. Salón ${aula}${piso}${salon.trim()}`;

  const parseUbicacion = (ubicacion: string) => {
    const match = ubicacion.match(/A(\d+)\.\s*Salón\s*(\d+)/i);

    if (!match) {
      return {
        aulaParsed: "1",
        pisoParsed: "1",
        salonParsed: "",
      };
    }

    const aulaParsed = match[1];
    const codigoSalon = match[2];

    return {
      aulaParsed,
      pisoParsed: codigoSalon[1] || "1",
      salonParsed: codigoSalon.slice(2) || "",
    };
  };

  const hasLocationConflict = useMemo(() => {
    if (!salon.trim()) return false;

    return existingLocations.includes(normalizeLocation(location));
  }, [existingLocations, location, salon]);

  const hasNameConflict = useMemo(() => {
    if (!name.trim()) return false;

    return existingRoomNames.includes(normalizeText(name));
  }, [existingRoomNames, name]);

  useEffect(() => {
    setLocation(buildUbicacion());
  }, [aula, piso, salon]);

  const fillForm = useCallback(
    (room: Sala, resourcesForRoom: Resource[], all: Resource[], allRooms: Sala[]) => {
      const { aulaParsed, pisoParsed, salonParsed } = parseUbicacion(room.ubicacion);

      setRoomData(room);
      setEnabled(room.estado);
      setName(room.nombre);
      setLocation(room.ubicacion);
      setCapacity(String(room.capacidad));
      setDescription(room.descripcion);

      setAula(aulaParsed);
      setPiso(pisoParsed);
      setSalon(salonParsed);

      setResources(resourcesForRoom);
      setOriginalResources(resourcesForRoom);
      setAllResources(all);

      const locations = allRooms
        .filter((item) => String(item.id_sala) !== String(room.id_sala))
        .map((item) => normalizeLocation(item.ubicacion || ""))
        .filter(Boolean);

      setExistingLocations(locations);

      const roomNames = allRooms
        .filter((item) => {
          const isCurrentRoom = String(item.id_sala) === String(room.id_sala);
          const isSameFaculty = String(item.id_facultad) === String(room.id_facultad);

          return !isCurrentRoom && isSameFaculty;
        })
        .map((item) => normalizeText(item.nombre || ""))
        .filter(Boolean);

      setExistingRoomNames(roomNames);

      setPendingAssignedResourceIds([]);
      setSelectedResourceId("");
    },
    []
  );

  const loadData = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);

      const [room, allBackendResources, allRooms] = await Promise.all([
        getRoomById(String(roomId)),
        getResources(),
        getRooms(),
      ]);

      const resourcesForRoom = allBackendResources.filter(
        (resource) => Number(resource.id_sala) === Number(roomId)
      );

      fillForm(room, resourcesForRoom, allBackendResources, allRooms);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("No se pudo cargar la información de la sala.");
    } finally {
      setLoading(false);
    }
  }, [roomId, fillForm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addResource = () => {
    if (!selectedResourceId || !roomId) return;

    const selected = allResources.find(
      (resource) => String(resource.id_recurso) === selectedResourceId
    );

    if (!selected) return;

    const alreadyAssigned = resources.some(
      (resource) => String(resource.id_recurso) === selectedResourceId
    );

    if (alreadyAssigned) {
      toast.error("Ese recurso ya está asociado a esta sala.");
      return;
    }

    const reassignedResource: Resource = {
      ...selected,
      id_sala: Number(roomId),
    };

    setResources((prev) => [...prev, reassignedResource]);

    const wasOriginallyInRoom = originalResources.some(
      (resource) => String(resource.id_recurso) === selectedResourceId
    );

    if (!wasOriginallyInRoom) {
      setPendingAssignedResourceIds((prev) =>
        prev.includes(selectedResourceId) ? prev : [...prev, selectedResourceId]
      );
    }

    setSelectedResourceId("");
  };

  const deleteResourceNow = async (resource: Resource) => {
    const resourceId = String(resource.id_recurso);
    const wasAddedInThisEdit = pendingAssignedResourceIds.includes(resourceId);

    if (wasAddedInThisEdit) {
      setResources((prev) =>
        prev.filter((item) => String(item.id_recurso) !== resourceId)
      );

      setPendingAssignedResourceIds((prev) =>
        prev.filter((id) => id !== resourceId)
      );

      return;
    }

    await updateResource(resourceId, {
      id_sala: 0,
      nombre: resource.nombre,
      descripcion: resource.descripcion,
      tipo: resource.tipo,
    });

    setResources((prev) =>
      prev.filter((item) => String(item.id_recurso) !== resourceId)
    );

    setAllResources((prev) =>
      prev.map((item) =>
        String(item.id_recurso) === resourceId
          ? { ...item, id_sala: 0 }
          : item
      )
    );

    setOriginalResources((prev) =>
      prev.filter((item) => String(item.id_recurso) !== resourceId)
    );
  };

  const handleSave = async () => {
    if (!roomId || !roomData) return;

    if (hasNameConflict) {
      toast.error("No se puede actualizar la sala", {
        description: "Ya existe una sala con este nombre en esta facultad.",
      });
      return;
    }

    if (hasLocationConflict) {
      toast.error("No se puede actualizar la sala", {
        description: "Ya existe una sala en esta ubicación.",
      });
      return;
    }

    if (!name.trim() || !salon.trim() || !description.trim()) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }

    try {
      setSaving(true);

      const roomPayload: Omit<Sala, "id_sala"> = {
        id_facultad: roomData.id_facultad,
        capacidad: Number(capacity),
        estado: enabled,
        fecha_creacion: roomData.fecha_creacion,
        imagen_sala: roomData.imagen_sala,
        nombre: name.trim(),
        ubicacion: buildUbicacion(),
        descripcion: description.trim(),
      };

      await updateRoom(String(roomId), roomPayload);

      await Promise.all(
        pendingAssignedResourceIds.map((resourceId) => {
          const resource = allResources.find(
            (item) => String(item.id_recurso) === resourceId
          );

          if (!resource) return Promise.resolve();

          return updateResource(String(resource.id_recurso), {
            id_sala: Number(roomId),
            nombre: resource.nombre,
            descripcion: resource.descripcion,
            tipo: resource.tipo,
          });
        })
      );

      await loadData();

      toast.success("Operación exitosa", {
        description: "La sala y sus recursos fueron actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error actualizando sala y recursos:", error);
      toast.error("La operación no fue exitosa", {
        description: "No se pudieron guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <EditRoomSkeleton />;
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar2 />
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-red-600 shadow-sm">
            No se pudo cargar la información de la sala.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-400">
            <span
              className="cursor-pointer hover:text-gray-600"
              onClick={() => router.push("/dashboard")}
            >
              Salas
            </span>
            <span>›</span>
            <span className="text-gray-600">{name || roomId}</span>
          </div>

          <div className="mb-2 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Sala y Recursos
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Actualizar detalles de la sala, estado y gestionar recursos disponibles
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5">
              <span className="text-sm text-gray-600">Estado de la Sala</span>

              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                disabled={saving}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? "bg-green-500" : "bg-gray-300"
                  } ${saving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <span
                  className={`absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                >
                  {enabled && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>

              <span
                className={`text-sm font-medium ${enabled ? "text-green-600" : "text-gray-400"
                  }`}
              >
                {enabled ? "Habilitada" : "Inhabilitada"}
              </span>
            </div>
          </div>

          <div className="mb-8 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 shrink-0 text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <div>
              <p className="text-sm font-semibold text-orange-600">
                Deshabilitar esta sala afectará las reservas activas
              </p>
              <p className="mt-0.5 text-sm text-orange-500">
                Esta sala tiene una reserva activa. Se notificará al usuario y se cancelará la reserva.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <h2 className="mb-5 text-base font-semibold text-gray-800">
                Detalles de la Sala
              </h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${hasNameConflict
                        ? "border-red-400 text-red-600 focus:border-red-500"
                        : "border-gray-200 text-gray-800 focus:border-red-400"
                      }`}
                  />

                  {hasNameConflict && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      Ya existe una sala con este nombre en esta facultad.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Ubicación
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={aula}
                      onChange={(e) => setAula(e.target.value)}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="1">Aula 1</option>
                      <option value="2">Aula 2</option>
                      <option value="3">Aula 3</option>
                      <option value="4">Aula 4</option>
                    </select>

                    <select
                      value={piso}
                      onChange={(e) => setPiso(e.target.value)}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <option value="1">Piso 1</option>
                      <option value="2">Piso 2</option>
                      <option value="3">Piso 3</option>
                      <option value="4">Piso 4</option>
                    </select>

                    <input
                      value={salon}
                      onChange={(e) => setSalon(e.target.value.replace(/\D/g, ""))}
                      disabled={saving}
                      placeholder="Salón"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${hasLocationConflict
                          ? "border-red-400 text-red-600 focus:border-red-500"
                          : "border-gray-200 text-gray-800 focus:border-red-400"
                        }`}
                    />
                  </div>

                  <input
                    value={location}
                    readOnly
                    disabled={saving}
                    className={`mt-2 w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm outline-none ${hasLocationConflict
                        ? "border-red-400 text-red-600"
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
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Capacidad
                  </label>

                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Descripción / Notas
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <RoomResourcesManager
                resources={resources}
                allResources={allResources}
                selectedResourceId={selectedResourceId}
                onSelectedResourceChange={setSelectedResourceId}
                onAddResource={addResource}
                onDeleteResource={deleteResourceNow}
                saving={saving}
                roomName={name}
                roomId={roomId}
                pendingAssignedResourceIds={pendingAssignedResourceIds}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              onClick={() => router.push("/dashboard")}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={saving || hasLocationConflict || hasNameConflict}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditRoomPage;