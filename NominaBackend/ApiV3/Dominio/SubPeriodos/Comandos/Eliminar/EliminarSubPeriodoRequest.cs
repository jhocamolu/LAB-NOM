﻿using ApiV3.Infraestructura.Resultados;
using MediatR;

namespace ApiV3.Dominio.SubPeriodos.Comandos.Eliminar
{
    public class EliminarSubPeriodoRequest : IRequest<CommandResult>
    {
        public int Id { get; set; }
    }
}
