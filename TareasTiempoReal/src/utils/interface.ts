
export interface ODATANotificacionDestinatarios {
    value: NotificacionDestinatario[]
}

export interface NotificacionDestinatario {
    id: number,
    notificacionId: number,
    funcionarioId: number,
    estado: string,
    notificacion: {
        tipo: string,
        titulo: string,
        mensaje: string
    },
    funcionario: {
        numeroDocumento: string
    }

}