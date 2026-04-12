export interface Sala {
    id_sala?: string; // normalmente el backend lo genera
    id_facultad: number;
    capacidad: number;
    estado: boolean;
    fecha_creacion?: string; // o Date, según tu API
    imagen_sala: string;
    nombre: string;
    ubicacion: string;
    descripcion: string;
    recursosTecnologico: string[];
}