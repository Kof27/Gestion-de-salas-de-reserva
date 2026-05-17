"use client";

import {
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    Wrench,
} from "lucide-react";

import Navbar from "@/src/widgets/navbar/ui/Navbar";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";

import { useResourcesPage } from "../hooks/useResourcesPage";

export function ResourcesPage() {
    const {
        filteredResources,
        rooms,
        loading,
        saving,
        error,

        searchTerm,
        setSearchTerm,
        selectedType,
        setSelectedType,
        resourceTypes,

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
    } = useResourcesPage();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Recursos
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Administra los recursos tecnológicos asociados a las salas.
                            </p>
                        </div>

                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                        >
                            <Plus className="h-4 w-4" />
                            Añadir recurso
                        </button>
                    </div>

                    <div className="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Buscar por nombre, descripción, tipo o sala..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-red-400"
                            />
                        </div>

                        <select
                            value={selectedType}
                            onChange={(event) => setSelectedType(event.target.value)}
                            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-red-400"
                        >
                            <option value="todos">Todos los tipos</option>

                            {resourceTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            Cargando recursos...
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                            {error}
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                            No hay recursos que coincidan con los filtros.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Recurso
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Tipo
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Sala
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Descripción
                                        </th>

                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredResources.map((resource) => (
                                        <tr
                                            key={resource.id}
                                            className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                                                        <Wrench className="h-4 w-4 text-red-400" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {resource.nombre}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            ID: {resource.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                    {resource.tipo}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {resource.roomName}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {resource.roomLocation}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="max-w-sm px-4 py-4 text-sm text-gray-500">
                                                <p className="line-clamp-2">
                                                    {resource.descripcion}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEditForm(resource)}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-blue-500"
                                                        title="Editar recurso"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => openDeleteModal(resource)}
                                                        disabled={!!deletingResourceId}
                                                        className="p-1.5 text-gray-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                        title="Eliminar recurso"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/60">
                    <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingResource ? "Editar recurso" : "Añadir recurso"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Completa la información del recurso y asígnalo a una sala.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Nombre
                                </label>

                                <input
                                    value={formValues.nombre}
                                    onChange={(event) =>
                                        updateFormValue("nombre", event.target.value)
                                    }
                                    placeholder="Ej: Proyector 4K"
                                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-red-400"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Tipo
                                </label>

                                <input
                                    value={formValues.tipo}
                                    onChange={(event) =>
                                        updateFormValue("tipo", event.target.value)
                                    }
                                    placeholder="Ej: audiovisual, cómputo, mobiliario"
                                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-red-400"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Sala
                                </label>

                                <select
                                    value={formValues.id_sala}
                                    onChange={(event) =>
                                        updateFormValue("id_sala", event.target.value)
                                    }
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-red-400"
                                >
                                    <option value="">Sin sala asignada</option>

                                    {rooms.map((room) => (
                                        <option
                                            key={String(room.id_sala)}
                                            value={String(room.id_sala)}
                                        >
                                            {room.nombre} - {room.ubicacion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Descripción
                                </label>

                                <textarea
                                    value={formValues.descripcion}
                                    onChange={(event) =>
                                        updateFormValue("descripcion", event.target.value)
                                    }
                                    placeholder="Describe brevemente el recurso..."
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-red-400"
                                />
                            </div>
                        </div>

                        <div className="mt-7 flex gap-3">
                            <button
                                onClick={closeForm}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : editingResource ? (
                                    "Guardar cambios"
                                ) : (
                                    "Crear recurso"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resourceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/60">
                    <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <Trash2 className="h-8 w-8 text-red-500" />
                        </div>

                        <h2 className="mb-3 text-xl font-bold text-gray-900">
                            ¿Eliminar recurso?
                        </h2>

                        <p className="mb-7 text-sm leading-relaxed text-gray-500">
                            ¿Está seguro de que desea eliminar el recurso{" "}
                            <span className="font-bold text-gray-800">
                                "{resourceToDelete.nombre}"
                            </span>
                            ? Esta acción no se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={!!deletingResourceId}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Volver
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={!!deletingResourceId}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {deletingResourceId ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    "Eliminar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}