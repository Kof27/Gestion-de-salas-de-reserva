# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma
Responde siempre en español.

## Rol y scope
**Mi trabajo es exclusivamente el frontend.** No proponer, modificar ni tocar nada dentro de `backend/`.
Antes de crear o modificar cualquier archivo, confirma que está dentro del scope de frontend.

## Project Overview

Sistema de reserva de salas ("Gestión de Salas de Reunión") para la Universidad Autónoma de Occidente.
Monorepo full-stack: frontend Next.js + backend Express/MySQL.

## Commands

### Frontend (directorio raíz)
```
npm run dev        # Servidor de desarrollo en http://localhost:3000
npm run build      # Build de producción
npm run lint       # ESLint
```

### Backend (solo referencia, no modificar)
```
npm --prefix backend start     # Servidor en http://localhost:4000
npm --prefix backend dev:api   # Dev server con nodemon
```

## Arquitectura Frontend

- **Framework**: Next.js (App Router) con React 19 y TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui (primitivos Radix UI)
- **Path alias**: `@/*` resuelve a la raíz del proyecto

### Estructura de carpetas

```
app/                  # App Router de Next.js — solo wrappers de enrutamiento
  api/auth/login/     # Excepción: proxy hacia el backend (no tocar)
  booking/
  createRoom/
  editRoom/
  login/
  register/
  reservas/
  salas/
  layout.tsx
  page.tsx

src/                  # Lógica real del frontend con Feature-Sliced Design
  app/                # Providers y configuración global
  entities/           # Modelos del dominio (Room, Reserva, Usuario...)
  features/           # Módulos de feature autocontenidos
  pages/              # Componentes de página completos
  shared/             # Utilidades transversales y cliente API
  widgets/            # Bloques compuestos de UI

components/           # ⚠️ Carpeta legacy — no crear archivos nuevos aquí
hooks/                # ⚠️ Carpeta legacy — no crear archivos nuevos aquí
lib/                  # ⚠️ Carpeta legacy — no crear archivos nuevos aquí
backend/              # ⛔ FUERA DE SCOPE — no modificar
```

> Los componentes de `app/` son wrappers delgados que renderizan los componentes reales de `src/pages/`.

### Reglas de Feature-Sliced Design (FSD)

El FSD no es estricto en este proyecto pero se respetan estas reglas base:

1. **Capas de mayor a menor nivel:** `app` → `pages` → `widgets` → `features` → `entities` → `shared`
2. **Las capas solo importan capas de nivel inferior.** Nunca al revés.
   - ✅ `features/` puede importar de `entities/` y `shared/`
   - ❌ `shared/` NO puede importar de `features/`
   - ❌ Una feature NO puede importar de otra feature directamente
3. **Todo código nuevo va en `src/`**, nunca en `components/`, `hooks/` o `lib/` de la raíz.
4. **Antes de crear un archivo**, identificar a qué capa FSD pertenece.

### Convenciones de código

- TypeScript obligatorio en todos los archivos nuevos
- Componentes en PascalCase con tipos explícitos en props
- No usar `any` en TypeScript
- Llamadas al backend solo desde `src/shared/api/` o desde la capa `api/` de cada feature

## Conexión Frontend → Backend

El frontend llama directamente al backend en `http://localhost:4000`.
No hay proxy de Next.js, excepto en `app/api/auth/login` (no modificar).

**Rutas del backend disponibles** (solo como referencia para construir llamadas desde el frontend):
| Prefijo | Dominio |
|--------|--------|
| `/api/auth` | Login, registro, cambio de contraseña |
| `/api/usuarios` | CRUD de usuarios |
| `/api/salas` | CRUD de salas |
| `/api/reservas` | CRUD de reservas |
| `/api/facultades` | Facultades universitarias |
| `/api/recursos` | Recursos tecnológicos |
| `/api/roles` | Roles |
| `/api/logs` | Log de auditoría |

La autenticación usa JWT. El token se valida en el backend — el frontend solo debe enviarlo en el header `Authorization: Bearer <token>`.

## Reglas de negocio relevantes para el frontend

- Emails deben terminar en `@uao.edu.co`
- Contraseñas: mínimo 8 caracteres, al menos 1 mayúscula y 1 número
- No se permiten reservas en fechas pasadas ni domingos
- Los roles (Profesor, Admin, etc.) controlan qué funciones se muestran en la UI
