export interface Sala {
    id_sala?: string;
    id_facultad: number;
    capacidad: number;
    estado: boolean;
    fecha_creacion?: string;
    imagen_sala: string | null;
    nombre: string;
    ubicacion: string;
    descripcion: string;
}