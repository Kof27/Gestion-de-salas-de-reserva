import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { nombre, correo, contrasena } = await request.json();

        // Validar campos requeridos
        if (!nombre || !correo || !contrasena) {
            return NextResponse.json(
                { msg: 'Nombre, correo y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Llamar al backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, correo, contrasena }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error en registro:', error);
        return NextResponse.json(
            { msg: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}