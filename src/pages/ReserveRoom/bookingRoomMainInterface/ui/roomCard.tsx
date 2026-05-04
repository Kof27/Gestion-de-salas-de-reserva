import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sala } from "@/src/entities/room";
import {Users} from "lucide-react";


export default function RoomCard({ room, onReservar }: { room: Sala; onReservar: (room: Sala) => void }) {
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
            </CardContent>

            <CardFooter className="flex justify-center">
                <Button
                    onClick={() => onReservar(room)}
                    disabled={!room.estado}
                    className="h-12 w-full rounded-lg bg-red-500 text-base font-semibold text-white hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Reservar
                </Button>
            </CardFooter>
        </Card>
    );
}