"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || 'Error al iniciar sesión');
                return;
            }

            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('token', data.token);

            if (data.usuario.id_rol === 1) {
                router.push('/booking');
            } else {
                router.push('/salas');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-[url('/uaologinphoto.webp')] bg-cover bg-center px-4 py-8 sm:py-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <Card className="relative w-full max-w-sm shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                <CardHeader className="items-center pb-2 pt-5 sm:pt-6 gap-3">
                    <div className="flex flex-col items-center gap-1">
                        <Image
                            src="/UAO-LOGO.png"
                            alt="Logo UAO"
                            width={110}
                            height={44}
                            className="object-contain"
                            priority
                        />
                        <span className="text-xs text-muted-foreground tracking-wide uppercase">
                            Centro de reservas
                        </span>
                    </div>
                </CardHeader>

                <div className="px-4 sm:px-6">
                    <Separator />
                </div>

                <CardContent className="px-5 sm:px-8 pt-4 pb-2">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-medium">
                                Correo institucional
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu.correo@uao.edu.co"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                                disabled={loading}
                                className="h-11 text-base sm:h-10 sm:text-sm"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="font-medium">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 text-base sm:h-10 sm:text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />
                                    }
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="h-10 bg-[#EC1313] hover:bg-red-700 font-semibold mt-1"
                            disabled={loading}
                        >
                            {loading
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando sesión...</>
                                : 'Iniciar sesión'
                            }
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex-col px-5 sm:px-8 pb-6 sm:pb-8 pt-3 gap-3">
                    <div className="flex items-center gap-3 w-full">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">o</span>
                        <Separator className="flex-1" />
                    </div>
                    <Button variant="outline" className="w-full h-10 font-medium" asChild>
                        <Link href="/register">¿No tienes cuenta? Regístrate</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export { LoginPage }
export default LoginPage
