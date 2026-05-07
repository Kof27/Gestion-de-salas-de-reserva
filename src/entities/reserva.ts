export interface reserva {
    id_reserva: number | string;
    id_sala: number | string;
    id_usuario: number | string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: boolean;
    fecha_creacion?: string;
    motivo: string;
}