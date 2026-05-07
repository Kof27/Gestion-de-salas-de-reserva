'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const links = [
  { label: 'Salas', href: '/salas' },
  { label: 'Reservas', href: '/reservas' },
  { label: 'Reportes', href: '/reportes' },
]

export default function Navbar2() {
  const pathname = usePathname() ?? ''
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">Salas de Reuniones UAO</span>
      </div>

      <nav className="flex items-center gap-6">
        {links.map(link => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium pb-0.5 transition-colors ${active
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Avatar
          className="h-9 w-9 border border-slate-200 bg-red-500 text-white shadow-sm cursor-default"
          title={usuario?.nombre}
        >
          <AvatarFallback className="bg-red-500 text-sm font-bold text-white">
            {usuario?.correo?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

      </div>
    </header>
  )
}