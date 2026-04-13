"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
            console.log('Enviando datos:', { correo, contrasena }); // Debug: Verificar datos enviados
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || 'Error al iniciar sesión');
                return;
            }

            // ✅ Login exitoso
            console.log('Usuario logueado:', data.usuario);
            
            // Guardar datos del usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirigir al dashboard
            router.push('/dashboard');

        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/uaologinphoto.webp')] bg-cover bg-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Inicia sesión con tu correo institucional</CardTitle>
                    <CardDescription>
                        Ingresa tu correo y luego tu contraseña para iniciar sesión
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu.correo@uao.edu.co"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                        </div>
                        <Button 
                            type="submit" 
                            className="bg-[#EC1313] font-bold w-full mt-6 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button variant="outline" className="w-full">
                        <Link href="/register">
                            ¿No tienes usuario? ¡Regístrate!
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export { LoginPage }
export default LoginPage