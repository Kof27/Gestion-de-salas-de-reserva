'use client'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UsuarioSesion = {
  nombre?: string;
  correo?: string;
};

export default function Navbar2() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuario');
      setUsuario(raw ? (JSON.parse(raw) as UsuarioSesion) : null);
    } catch {
      setUsuario(null);
    }
  }, []);

  const handleToggleSidebar = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón hamburguesa siempre visible */}
          <button
            onClick={handleToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              <span className="hidden sm:inline">Salas de Reuniones UAO</span>
              <span className="sm:hidden">UAO</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Avatar
            className="h-9 w-9 border border-slate-200 bg-red-500 text-white shadow-sm cursor-default"
            title={usuario?.nombre}
          >
            <AvatarFallback className="bg-red-500 text-sm font-bold text-white">
              {usuario?.correo?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
