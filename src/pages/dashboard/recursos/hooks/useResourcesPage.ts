"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Resource } from "@/src/entities/recurso";
import type { Sala } from "@/src/entities/room";

import { getRooms } from "@/src/shared/api/getRooms";
import {
    createResource,
    deleteResource,
    getResources,
    updateResource,
} from "@/src/shared/api/getRecursos";

import {
    filterResources,
    mapResourceToView,
    validateResourceForm,
    type ResourceFormValues,
    type ResourceView,
} from "../lib/resourceMapper";

const EMPTY_FORM: ResourceFormValues = {
    id_sala: "",
    nombre: "",
    descripcion: "",
};

type UsuarioSesion = {
    id_usuario: number | string;
    id_facultad: number | string;
    id_rol: number | string;
    nombre: string;
    correo: string;
};

function getUsuarioFromLocalStorage(): UsuarioSesion | null {
    if (typeof window === "undefined") return null;

    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser) as UsuarioSesion;
    } catch (error) {
        console.error("Error leyendo usuario desde localStorage:", error);
        return null;
    }
}

export function useResourcesPage() {
    const [resources, setResources] = useState<ResourceView[]>([]);
    const [rooms, setRooms] = useState<Sala[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceView | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<ResourceView | null>(null);

    const [formValues, setFormValues] = useState<ResourceFormValues>(EMPTY_FORM);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const usuario = getUsuarioFromLocalStorage();

            if (!usuario?.id_facultad) {
                setRooms([]);
                setResources([]);
                setError("No se pudo identificar la facultad del usuario.");
                return;
            }

            const [resourcesData, roomsData] = await Promise.all([
                getResources(),
                getRooms(),
            ]);

            const roomsMismaFacultad = roomsData.filter(
                (room) => String(room.id_facultad) === String(usuario.id_facultad)
            );

            const roomIds = new Set(
                roomsMismaFacultad.map((room) => String(room.id_sala))
            );

            const resourcesFiltrados = resourcesData.filter((resource) => {
                if (resource.id_sala === null || resource.id_sala === undefined) {
                    return true;
                }

                return roomIds.has(String(resource.id_sala));
            });

            setRooms(roomsMismaFacultad);

            setResources(
                resourcesFiltrados.map((resource) =>
                    mapResourceToView(resource, roomsMismaFacultad)
                )
            );
        } catch (error) {
            console.error("Error cargando recursos:", error);
            setError("No se pudieron cargar los recursos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredResources = useMemo(() => {
        return filterResources({
            resources,
            searchTerm,
        });
    }, [resources, searchTerm]);

    const openCreateForm = () => {
        setEditingResource(null);
        setFormValues(EMPTY_FORM);
        setIsFormOpen(true);
    };

    const openEditForm = (resource: ResourceView) => {
        setEditingResource(resource);

        setFormValues({
            id_sala: resource.raw.id_sala ? String(resource.raw.id_sala) : "",
            nombre: String(resource.raw.nombre ?? ""),
            descripcion: String(resource.raw.descripcion ?? ""),
        });

        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (saving) return;

        setIsFormOpen(false);
        setEditingResource(null);
        setFormValues(EMPTY_FORM);
    };

    const updateFormValue = (
        field: keyof ResourceFormValues,
        value: string
    ) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        const validationError = validateResourceForm(formValues);

        if (validationError) {
            toast.error("Formulario incompleto", {
                description: validationError,
            });
            return;
        }

        try {
            setSaving(true);

            const payload: Omit<Resource, "id_recurso"> = {
                id_sala: formValues.id_sala ? Number(formValues.id_sala) : null,
                nombre: String(formValues.nombre ?? "").trim(),
                descripcion: String(formValues.descripcion ?? "").trim(),
            };

            if (editingResource) {
                const resourceId = editingResource.raw.id_recurso ?? editingResource.id;

                const updated = await updateResource(String(resourceId), payload);

                setResources((prev) =>
                    prev.map((resource) =>
                        resource.id === editingResource.id
                            ? mapResourceToView(updated, rooms)
                            : resource
                    )
                );

                toast.success("Operación exitosa", {
                    description: "El recurso fue actualizado correctamente.",
                });
            } else {
                const created = await createResource(payload);

                setResources((prev) => [
                    mapResourceToView(created, rooms),
                    ...prev,
                ]);

                toast.success("Operación exitosa", {
                    description: "El recurso fue creado correctamente.",
                });
            }

            setIsFormOpen(false);
            setEditingResource(null);
            setFormValues(EMPTY_FORM);
        } catch (error) {
            console.error("Error guardando recurso:", error);

            toast.error("La operación no fue exitosa", {
                description:
                    error instanceof Error
                        ? error.message
                        : "No se pudo guardar el recurso.",
            });
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (resource: ResourceView) => {
        setResourceToDelete(resource);
    };

    const closeDeleteModal = () => {
        if (deletingResourceId) return;

        setResourceToDelete(null);
    };

    const handleDelete = async () => {
        if (!resourceToDelete) return;

        try {
            setDeletingResourceId(resourceToDelete.id);

            const resourceId =
                resourceToDelete.raw.id_recurso ?? resourceToDelete.id;

            await deleteResource(resourceId);

            setResources((prev) =>
                prev.filter((resource) => resource.id !== resourceToDelete.id)
            );

            toast.success("Operación exitosa", {
                description: "El recurso fue eliminado correctamente.",
            });

            setResourceToDelete(null);
        } catch (error) {
            console.error("Error eliminando recurso:", error);

            toast.error("La operación no fue exitosa", {
                description:
                    error instanceof Error
                        ? error.message
                        : "No se pudo eliminar el recurso.",
            });
        } finally {
            setDeletingResourceId(null);
        }
    };

    return {
        resources,
        filteredResources,
        rooms,

        loading,
        saving,
        error,

        searchTerm,
        setSearchTerm,

        isFormOpen,
        editingResource,
        formValues,
        openCreateForm,
        openEditForm,
        closeForm,
        updateFormValue,
        handleSubmit,

        resourceToDelete,
        deletingResourceId,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,

        reloadResources: loadData,
    };
}