'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/src/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/src/widgets/sidebar/ui/Sidebar'

type RoomStatus = 'habilitada' | 'inhabilitada'

interface Room {
    id: string
    name: string
    location: string
    capacity: number
    status: RoomStatus
}

const initialRooms: Room[] = [
    { id: '1', name: 'Sala de Juntas 1', location: 'Edificio Central, Piso 2', capacity: 12, status: 'habilitada' },
    { id: '2', name: 'Sala de Seminarios A', location: 'Edificio de Ingeniería, Piso 1', capacity: 40, status: 'habilitada' },
    { id: '3', name: 'Cubículo 3', location: 'Biblioteca, Piso 3', capacity: 4, status: 'inhabilitada' },
    { id: '4', name: 'Sala de Profesores', location: 'Edificio Central, Piso 3', capacity: 20, status: 'habilitada' },
    { id: '5', name: 'Auditorio Menor', location: 'Edificio de Ingeniería, Piso 2', capacity: 100, status: 'habilitada' },
]

export const DashboardPage = () => {
    const [rooms, setRooms] = useState<Room[]>(initialRooms)
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)

    const toggleStatus = (id: string) => {
        setRooms(prev => prev.map(r =>
            r.id === id
                ? { ...r, status: r.status === 'habilitada' ? 'inhabilitada' : 'habilitada' }
                : r
        ))
    }


    const confirmDelete = (room: Room) => {
        setRoomToDelete(room)
    }

    const handleDelete = () => {
        if (!roomToDelete) return
        setRooms(prev => prev.filter(r => r.id !== roomToDelete.id))
        setRoomToDelete(null)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">

                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Salas de Reuniones</h1>
                            <p className="text-sm text-gray-500 mt-1">Administrar espacios para la Facultad de Ingeniería</p>
                        </div>
                        <Link
                            href="/newRoom"
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                        >
                            + Crear Nueva Sala
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ubicación</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Capacidad</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{room.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">{room.location}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {room.capacity}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleStatus(room.id)}
                                                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${room.status === 'habilitada' ? 'bg-red-500' : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${room.status === 'habilitada' ? 'translate-x-5' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                                <span className={`text-sm ${room.status === 'habilitada' ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {room.status === 'habilitada' ? 'Habilitada' : 'Inhabilitada'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => confirmDelete(room)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    href={`/room/`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </main>
            </div>
            {roomToDelete && (
                <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm mx-4 text-center shadow-xl">

                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            ¿Eliminar Sala de Reuniones?
                        </h2>

                        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                            ¿Está seguro de que desea eliminar la sala{' '}
                            <span className="font-bold text-gray-800">"{roomToDelete.name}"</span>?
                            Esta acción no se puede deshacer y se perderá todo el historial asociado.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRoomToDelete(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}