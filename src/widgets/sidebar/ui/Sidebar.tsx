"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type UsuarioSesion = {
  id_usuario?: number | string;
  id_facultad?: number | string;
  id_rol?: number | string;
  nombre?: string;
  correo?: string;
};

const FACULTADES: Record<string, string> = {
  "1": "Facultad de Ingeniería",
  "2": "Facultad de Administración",
  "3": "Facultad de Comunicación Social, Periodismo y Medios Digitales",
  "4": "Facultad de Ciencias Humanas y Artes",
  "5": "Facultad de Arquitectura, Urbanismo y Diseño",
  "6": "Facultad de Ciencias Básicas",
};

const items = [
  {
    label: "Salas",
    href: "/salas",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"
        />
      </svg>
    ),
  },
  {
    label: "Reservas",
    href: "/reservas",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Recursos",
    href: "/recursos",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

function getInitials(name?: string) {
  if (!name) return "US";

  const words = name.trim().split(" ");

  const first = words[0]?.[0] || "";
  const second = words[1]?.[0] || "";

  return `${first}${second}`.toUpperCase() || "US";
}

function getFacultyName(idFacultad?: number | string) {
  if (!idFacultad) return "Facultad";

  return FACULTADES[String(idFacultad)] || "Facultad";
}

export const Sidebar = () => {
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as UsuarioSesion;
      setUsuario(parsedUser);
    } catch (error) {
      console.error("Error leyendo usuario desde localStorage:", error);
      setUsuario(null);
    }
  }, []);

  const facultyName = useMemo(() => {
    return getFacultyName(usuario?.id_facultad);
  }, [usuario?.id_facultad]);

  const initials = useMemo(() => {
    return getInitials(usuario?.nombre);
  }, [usuario?.nombre]);

  return (
    <aside className="w-60 min-h-[calc(100vh-56px)] bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-3 py-4 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight text-gray-800">
            {usuario?.nombre || "Usuario"}
          </p>

          <p className="line-clamp-2 text-xs leading-tight text-gray-500">
            {facultyName}
          </p>
        </div>
      </div>
      <nav className="flex-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${active
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <span
                className={
                  active ? "text-red-500" : "text-gray-400"
                }
              >
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};