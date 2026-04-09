export interface Sala {
    id_sala?: string; // normalmente el backend lo genera
    id_facultad: number;
    name: string;
    capacity: number;
    address: string;
    description: string;
    estado: boolean;
    fecha_creation?: string; // o Date, según tu API
    photo: string;
    recursosTecnologico: string[];
}