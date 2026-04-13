"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Navbar2 } from "@/src/widgets/navbar2/ui/Navbar2";
import { getRoomById, updateRoom } from "@/src/shared/api/getRooms";
import { getResources, updateResource } from "@/src/shared/api/getRecursos";

import type { Sala } from "@/src/entities/room";
import type { Resource } from "@/src/entities/recurso";

function EditRoomSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mb-2 h-8 w-72 animate-pulse rounded bg-gray-200" />
          <div className="mb-8 h-4 w-96 animate-pulse rounded bg-gray-100" />

          <div className="mb-8 rounded-xl border border-gray-100 p-4">
            <div className="h-4 w-80 animate-pulse rounded bg-gray-200" />
          </div>

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

  const [resources, setResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pendingResourceAssignments, setPendingResourceAssignments] = useState<Resource[]>([]);

  const fillForm = useCallback((room: Sala, resourcesForRoom: Resource[], all: Resource[]) => {
    setRoomData(room);
    setEnabled(room.estado);
    setName(room.nombre);
    setLocation(room.ubicacion);
    setCapacity(String(room.capacidad));
    setDescription(room.descripcion);
    setResources(resourcesForRoom);
    setAllResources(all);
    setPendingResourceAssignments([]);
    setSelectedResourceId("");
  }, []);

  const loadData = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);

      const [room, allBackendResources] = await Promise.all([
        getRoomById(String(roomId)),
        getResources(),
      ]);

      const resourcesForRoom = allBackendResources.filter(
        (resource) => Number(resource.id_sala) === Number(roomId)
      );

      fillForm(room, resourcesForRoom, allBackendResources);
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

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => String(r.id_recurso) !== id));
    setPendingResourceAssignments((prev) =>
      prev.filter((r) => String(r.id_recurso) !== id)
    );
  };

  const addResource = () => {
    if (!selectedResourceId) return;

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
    setPendingResourceAssignments((prev) => [...prev, reassignedResource]);
    setSelectedResourceId("");
  };

  const handleSave = async () => {
    if (!roomId || !roomData) return;

    const previousRoom = roomData;
    const previousResources = [...resources];
    const previousPendingAssignments = [...pendingResourceAssignments];

    try {
      setSaving(true);
      setLoading(true);

      const roomPayload: Omit<Sala, "id_sala"> = {
        id_facultad: roomData.id_facultad,
        capacidad: Number(capacity),
        estado: enabled,
        fecha_creacion: roomData.fecha_creacion,
        imagen_sala: roomData.imagen_sala,
        nombre: name.trim(),
        ubicacion: location.trim(),
        descripcion: description.trim(),
        recursosTecnologico: roomData.recursosTecnologico,
      };

      await updateRoom(String(roomId), roomPayload);

      await Promise.all(
        pendingResourceAssignments.map((resource) =>
          updateResource(String(resource.id_recurso), {
            id_sala: Number(roomId),
            nombre: resource.nombre,
            descripcion: resource.descripcion,
            tipo: resource.tipo,
          })
        )
        
      );

      await loadData();

      toast.success("Operación exitosa", {
        description: "La sala y sus recursos fueron actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error actualizando sala y recursos:", error);

      setRoomData(previousRoom);
      setResources(previousResources);
      setPendingResourceAssignments(previousPendingAssignments);

      toast.error("La operación no fue exitosa", {
        description: "No se pudieron guardar los cambios.",
      });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const selectableResources = allResources.filter(
    (resource) =>
      !resources.some(
        (assigned) => String(assigned.id_recurso) === String(resource.id_recurso)
      )
  );

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
  console.log(resources)

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
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                  enabled ? "bg-green-500" : "bg-gray-300"
                } ${saving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <span
                  className={`absolute top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform duration-200 ${
                    enabled ? "translate-x-6" : "translate-x-1"
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
                className={`text-sm font-medium ${
                  enabled ? "text-green-600" : "text-gray-400"
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Ubicación
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-red-400"
                  />
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
              <h2 className="mb-5 text-base font-semibold text-gray-800">
                Recursos Tecnológicos
              </h2>

              <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                {resources.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-400">
                    Esta sala no tiene recursos asociados.
                  </div>
                ) : (
                  resources.map((resource, index) => (
                    <div
                      key={resource.id_recurso}
                      className={`flex items-center justify-between px-4 py-3 ${
                        index !== resources.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {resource.nombre}
                          </p>
                          <p className="text-xs text-gray-400">
                            {resource.descripcion}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteResource(String(resource.id_recurso))}
                        disabled={saving}
                        className="text-gray-300 transition-colors hover:text-red-400"
                      >
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
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">
                  Agregar Recurso
                </p>
                <div className="mb-2 grid grid-cols-1 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Recurso
                    </label>
                    <select
                      value={selectedResourceId}
                      onChange={(e) => setSelectedResourceId(e.target.value)}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
                    >
                      <option value="">Seleccionar recurso</option>
                      {selectableResources.map((resource) => (
                        <option
                          key={resource.id_recurso}
                          value={String(resource.id_recurso)}
                        >
                          {resource.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={addResource}
                  disabled={saving || !selectedResourceId}
                  className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + Agregar
                </button>
              </div>
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
              disabled={saving}
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