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

export default function page(){
    return(
        <div className="w-full min-h-screen flex items-center justify-center bg-[url('/uaologinphoto.webp')] bg-cover bg-center" >
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Inicia sesión con tu correo institucional</CardTitle>
                    <CardDescription>
                        Ingresa tu correo y luego tu contraseña para iniciar sesión
                    </CardDescription>

                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">correo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="@uao.edu.co"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <Input id="password" type="password" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="bg-[#EC1313] font-bold w-full">
                        Iniciar sesión
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Link href="/register">
                        ¿No tienes usuario? Registrate!
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>

    )
}