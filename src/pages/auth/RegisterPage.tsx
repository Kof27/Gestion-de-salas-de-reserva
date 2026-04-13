'use client'

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react" // Importamos los íconos
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [faculty, setFaculty] = useState<number | "">("");
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Función para validar la contraseña
    const validatePassword = (value: string) => {
        setPassword(value);

        if (value.length === 0) {
            setError("");
            return;
        }

        const isValid = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

        if (!isValid) {
            setError("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
        } else {
            setError("");
        }
    };

    // Función para validar el email
    const validateEmail = (value: string) => {
        setEmail(value);

        if (value.length === 0) {
            setEmailError("");
            return;
        }

        if (!value.endsWith('@uao.edu.co')) {
            setEmailError("El correo debe ser del dominio @uao.edu.co");
        } else {
            setEmailError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (error || emailError || password.length === 0 || email.length === 0 || name.length === 0) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: name,
                    correo: email,
                    contrasena: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario registrado exitosamente');
                // Redirect to login or something
                window.location.href = '/login';
            } else {
                setError(data.msg || 'Error al registrar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/campus-planeacion.webp')] bg-cover bg-center" >
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Regístrate con tu correo institucional</CardTitle>
                    <CardDescription>
                        Ingresa tu correo y luego tu contraseña para crear tu usuario
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => validateEmail(e.target.value)}
                                    placeholder="@uao.edu.co"
                                    required
                                    className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                                {emailError && (
                                    <span className="text-xs text-red-500 font-medium">
                                        {emailError}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="faculty">Facultad</Label>
                                <Select value={faculty.toString()} onValueChange={(value) => setFaculty(parseInt(value))}>
                                    <SelectTrigger id="faculty" className="w-full">
                                        <SelectValue placeholder="Selecciona tu facultad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ingeniería</SelectItem>
                                        <SelectItem value="2">Administración</SelectItem>
                                        <SelectItem value="3">Comunicación Social, Periodismo y Medios Digitales</SelectItem>
                                        <SelectItem value="4">Ciencias Humanas y Artes</SelectItem>
                                        <SelectItem value="5">Arquitectura, Urbanismo y Diseño</SelectItem>
                                        <SelectItem value="6">Ciencias Básicas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>

                                {/* Contenedor relativo para posicionar el ojo dentro del input */}
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"} // Cambia el tipo dinámicamente
                                        value={password}
                                        onChange={(e) => validatePassword(e.target.value)}
                                        required
                                        // Añadimos pr-10 para que el texto no se monte encima del icono
                                        className={`pr-10 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    />

                                    {/* Botón absoluto a la derecha */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <span className="text-xs text-red-500 font-medium">
                                        {error}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-6">
                            <Button
                                type="submit"
                                className="bg-[#EC1313] hover:bg-red-700 font-bold w-full"
                                disabled={!!error || password.length === 0 || email.length === 0 || !faculty}
                            >
                                {isLoading ? 'Registrando...' : 'Registrarte'}
                            </Button>
                            <Button type="button" variant="outline" className="w-full">
                                <Link href="/login">
                                    ¿Tienes usuario? Inicia sesión!
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export { RegisterPage }
export default RegisterPage