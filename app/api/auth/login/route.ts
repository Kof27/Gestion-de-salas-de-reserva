export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { correo, contrasena } = body;

        // Hacer la solicitud al backend en puerto 4000
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo, contrasena }),
        });

        const data = await response.json();

        if (!response.ok) {
            return Response.json(data, { status: response.status });
        }

        return Response.json(data);
    } catch (error) {
        console.error('Error en login:', error);
        return Response.json(
            { msg: 'Error en el servidor' },
            { status: 500 }
        );
    }
}
