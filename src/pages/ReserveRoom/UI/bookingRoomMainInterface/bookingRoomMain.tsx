"use client"
import React, { useMemo, useState, useEffect } from "react";
import {
    Search,
    SlidersHorizontal,
    Users,
    Monitor,
    Video,
    Wifi,
    Mic,
    Phone,
    Presentation,
    Camera,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BookingRoomWindows from "../bookingEspecificRoom/bookinRoom";
import NavbarBookingRoom from "@/src/widgets/navbarBookingRoom/navbarBookingRoom";
import { getRooms } from "../../API/getRooms";
import type { Sala } from "@/src/entities/room";

type Amenity =
    | "screen"
    | "video"
    | "wifi"
    | "mic"
    | "phone"
    | "presentation"
    | "camera";

const amenityIcons: Record<Amenity, React.ReactNode> = {
    screen: <Monitor className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    wifi: <Wifi className="h-4 w-4" />,
    mic: <Mic className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />,
    presentation: <Presentation className="h-4 w-4" />,
    camera: <Camera className="h-4 w-4" />,
};



function RoomCard({ room, onReservar }: { room: Sala; onReservar: (room: Sala) => void }) {
    return (
        <Card className="overflow-hidden rounded-xl  bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <div className="relative w-auto h-52 overflow-hidden">
                    <img
                        src={room.imagen_sala}
                        alt={room.nombre}
                        className="h-full w-full object-cover rounded-xl"
                    />

                    <Badge className={`absolute right-4 top-4 rounded-full bg-white px-3 py-1 shadow-sm hover:bg-white ${room.estado ? "text-emerald-600" : "text-red-600"}`}>
                        <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${room.estado ? "bg-emerald-500" : "bg-red-500"}`} />
                        {room.estado ? "Disponible" : "No disponible"}
                    </Badge>
                </div>
            </CardHeader>


            <CardContent className="">
                <div className="space-y-1.5">
                    <h3 className="text-[1.05rem] font-extrabold leading-tight text-slate-900 sm:text-xl">
                        {room.nombre}
                    </h3>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span className="text-sm sm:text-base">Capacidad: {room.capacidad} personas</span>
                    </div>
                </div>

                {room.recursosTecnologico && room.recursosTecnologico.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 text-red-500">
                        {room.recursosTecnologico.slice(0, 4).map((_recurso, index) => (
                            <div key={index} className="flex h-5 w-5 items-center justify-center">
                                {amenityIcons.screen}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-row gap-3 justify-center ">
                <Button
                    variant="secondary"
                    className="h-12 w-28 rounded-lg  bg-rose-50 text-base font-semibold text-red-600 hover:bg-rose-100"
                >
                    Ver disp.
                </Button>
                <Button
                    onClick={() => onReservar(room)}
                    disabled={!room.estado}
                    className="h-12 w-28 rounded-lg bg-red-500 text-base font-semibold text-white hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Reservar
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function RoomBookingPage() {
    const [search, setSearch] = useState("");
    const [rooms, setRooms] = useState<Sala[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Sala | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const data = await getRooms();
                setRooms(data);
            } catch (err) {
                setError("Error al cargar las salas");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) =>
            room.nombre.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, rooms]);

    const handleReservar = (room: Sala) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRoom(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
                <p className="text-lg text-slate-600">Cargando salas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
                <p className="text-lg text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
            <NavbarBookingRoom />

            <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                            Salas disponibles
                        </h1>
                        <p className="mt-3 max-w-2xl text-lg text-slate-600">
                            Encuentra y reserva espacios para tus reuniones académicas.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar sala..."
                                className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-base placeholder:text-slate-400 focus-visible:ring-red-500"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {filteredRooms.map((room) => (
                        <RoomCard key={room.id_sala} room={room} onReservar={handleReservar} />
                    ))}
                </section>
            </main>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop con blur */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    {/* Modal */}
                    <div className="relative">
                        {/* Botón cerrar */}


                        {/* Componente de reserva */}
                        <BookingRoomWindows roomId={selectedRoom?.id_sala} />
                    </div>
                </div>
            )}
        </div>
    );
}
