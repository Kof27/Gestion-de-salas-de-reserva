export interface reserva {
    id_reserva: string; // normalmente el backend lo genera
    id_sala: string;
    id_usuario: string;
    hora_inicio: Date; 
    hora_fin: Date;
    estado:boolean
    fecha_creacion?: Date
    motivo: string;
}