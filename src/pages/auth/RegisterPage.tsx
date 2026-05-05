'use client'

import { useState } from "react"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"

function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [faculty, setFaculty] = useState<number | "">("")
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const validatePassword = (value: string) => {
        setPassword(value)
        if (value.length === 0) { setError(""); return }
        if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
            setError("Mínimo 8 caracteres, una mayúscula y un número.")
        } else {
            setError("")
        }
    }

    const validateEmail = (value: string) => {
        setEmail(value)
        if (value.length === 0) { setEmailError(""); return }
        if (!value.endsWith('@uao.edu.co')) {
            setEmailError("El correo debe ser del dominio @uao.edu.co")
        } else {
            setEmailError("")
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (error || emailError || password.length === 0 || email.length === 0 || name.length === 0 || !faculty) return

        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:4000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: name,
                    correo: email,
                    contrasena: password,
                    id_facultad: faculty,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                alert('Usuario registrado exitosamente')
                window.location.href = '/login'
            } else {
                setError(data.msg || 'Error al registrar')
            }
        } catch {
            setError('Error de conexión')
        } finally {
            setIsLoading(false)
        }
    }

    const passwordValid = password.length > 0 && !error
    const isDisabled = !!error || !!emailError || password.length === 0 || email.length === 0 || name.length === 0 || !faculty

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-[url('/campus-planeacion.webp')] bg-cover bg-center px-4 py-8 sm:py-10">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <Card className="relative w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                <CardHeader className="items-center pb-2 pt-6 sm:pt-8 gap-3 sm:gap-4">
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
                    <div className="text-center space-y-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                            Crea tu cuenta
                        </CardTitle>
                    </div>
                </CardHeader>

                <div className="px-4 sm:px-6">
                    <Separator />
                </div>

                <CardContent className="px-5 sm:px-8 pt-4 pb-2">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="name" className="font-medium">Nombre completo</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre completo"
                                required
                                className="h-11 text-base sm:h-10 sm:text-sm"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="font-medium">Correo institucional</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => validateEmail(e.target.value)}
                                placeholder="tu.correo@uao.edu.co"
                                required
                                className={`h-11 text-base sm:h-10 sm:text-sm ${emailError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                            />
                            {emailError && (
                                <span className="flex items-center gap-1.5 text-xs text-red-600">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    {emailError}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="faculty" className="font-medium">Facultad</Label>
                            <select
                                id="faculty"
                                value={faculty.toString()}
                                onChange={(e) => setFaculty(parseInt(e.target.value))}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                            >
                                <option value="" disabled>Selecciona tu facultad</option>
                                <option value="1">Ingeniería</option>
                                <option value="2">Administración</option>
                                <option value="3">Comunicación Social, Periodismo y Medios Digitales</option>
                                <option value="4">Ciencias Humanas y Artes</option>
                                <option value="5">Arquitectura, Urbanismo y Diseño</option>
                                <option value="6">Ciencias Básicas</option>
                            </select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="font-medium">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => validatePassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={`h-11 text-base sm:h-10 sm:text-sm pr-10 ${error ? "border-red-400 focus-visible:ring-red-400" : passwordValid ? "border-green-400 focus-visible:ring-green-400" : ""}`}
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
                            {error && (
                                <span className="flex items-center gap-1.5 text-xs text-red-600">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    {error}
                                </span>
                            )}
                            {passwordValid && (
                                <span className="flex items-center gap-1.5 text-xs text-green-600">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                    Contraseña válida
                                </span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="h-10 bg-[#EC1313] hover:bg-red-700 font-semibold mt-2"
                            disabled={isDisabled || isLoading}
                        >
                            {isLoading
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                                : 'Crear cuenta'
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
                        <Link href="/login">¿Ya tienes cuenta? Inicia sesión</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export { RegisterPage }
export default RegisterPage
