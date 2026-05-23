# Gestión de Salas y Reservas - Universidad Autónoma de Occidente

Este proyecto es una aplicación web para la **gestión de salas y reservas** de la **Universidad Autónoma de Occidente**.

La plataforma permite administrar espacios, consultar disponibilidad y gestionar reservas de manera organizada y eficiente.

## Tecnologías utilizadas

El frontend fue desarrollado con las siguientes tecnologías:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js**
- **npm**

Puedes verificarlo con los siguientes comandos:

```bash
node -v
npm -v
```

## Instalación

Clona el repositorio y luego instala las dependencias:

```bash
npm install
```

## Archivo .env 
Este es importante tenerlo. Las credenciales estaran en la entrega en el apartado de anexos

> **Importante:** Se recomienda ejecutar `npm install` siempre que se haga merge de la rama `dev`, para asegurar que todas las dependencias estén actualizadas correctamente.

## Ejecución en entorno de desarrollo

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

Luego abre en tu navegador:
http://localhost:3000

## Ejecución servidor 
Debes tener en una terminal diferente ubicada dentro de Gestion-de-salas-de-reserva\backend. Depues ejecutas
```bash
node app.js
```

## Usuarios de prueba
Correo:mariana.torres@uao.edu.co
Contraseña: Password123
Rol: Secretaria del area de ingenieria 

Correo: markus.salazar@uao.edu.co
Contraseña: Password123
Rol: Secretario facultad de Ciencias Básicas

Se puede crear cualquier otro usuario de la facultad deseada pero solo con el rol docente
## Comandos útiles

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto en desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Ejecutar el proyecto en producción:

```bash
npm run start
```

Ejecutar lint:

```bash
npm run lint
```

## Estructura general del proyecto

Este proyecto está desarrollado con **Next.js** y **React**, siguiendo una estructura modular basada en componentes, páginas y tipado con TypeScript, lo que facilita su mantenimiento, escalabilidad y organización.

## Edición del proyecto

Puedes comenzar a modificar la aplicación desde los archivos del frontend según la estructura definida en el proyecto.

Los cambios se reflejarán automáticamente en el navegador mientras el servidor de desarrollo esté en ejecución.

## Recomendaciones de trabajo en equipo

- Ejecutar `npm install` después de clonar el proyecto.
- Ejecutar `npm install` cada vez que se haga merge desde `dev`.
- Verificar que el proyecto compile correctamente antes de subir cambios.
- Mantener consistencia en componentes, estilos y tipado con TypeScript.

## Despliegue

Para generar la versión lista para producción:

```bash
npm run build
```

Y para ejecutarla:

```bash
npm run start
```
