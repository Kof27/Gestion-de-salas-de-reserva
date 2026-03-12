

import Image from "next/image";
import Link from "next/link";

export function Navbar() {

    return (
        <header className="sticky w-full flex items-center bg-white h-16 shadow-sm">
            {/* Usamos justify-between para empujar los elementos a los extremos */}
            <div className="flex items-center justify-between px-6 w-full pl-10 pr-10">
                <div className="flex items-center justify-between">
                    {/* Logo — queda a la izquierda */}
                    <Image src={"/UAO-LOGO.png"} alt={"Uao logo"} width={100} height={100} />
                    <p className="font-bold text-2xl">Sala Reuniones UAO</p>
                </div>


                {/* Contenedor derecho: Links primero, luego la imagen */}
                <div className="flex items-center  gap-6">

                    {/* Links */}
                    <nav className="flex gap-4 font-medium text-lg text-[#475569]">
                        <Link href={"/"}>Inicio</Link>
                        <Link href={"/"}>Salas</Link>
                        <Link href={"/"}>Reservas</Link>
                        <Link href={"/"}>Reportes</Link>
                    </nav>

                    {/* Foto de perfil — aparece después de los links */}
                    <Image
                        src={"/pfp.jpg"}
                        alt={"profile photo"}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                </div>
            </div>
        </header>
    );
}
