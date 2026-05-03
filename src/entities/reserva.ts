export interface reserva {
    id_reserva?: string;
    id_sala: string;
    id_usuario: string;
    fecha: string | Date;
    hora_inicio: string | Date;
    hora_fin: string | Date;
    estado: boolean;
    fecha_creacion?: string | Date;
    motivo: string;
}