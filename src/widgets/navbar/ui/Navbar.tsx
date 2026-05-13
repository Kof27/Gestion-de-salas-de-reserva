'use client'
import Link from 'next/link'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usuario } from "@/src/entities/usuario";
import { Building2, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario] = useState<usuario | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("usuario");
      return raw ? (JSON.parse(raw) as usuario) : null;
    } catch {
      return null;
    }
  });
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.replace("/login");
  };
  const inicialCorreo = usuario?.correo
    ? usuario.correo.charAt(0).toUpperCase()
    : "U";
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">UAO - Secretaria</span>
      </div>


      {/* Avatar + logout */}
      <div className="flex items-center gap-2">

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )

}