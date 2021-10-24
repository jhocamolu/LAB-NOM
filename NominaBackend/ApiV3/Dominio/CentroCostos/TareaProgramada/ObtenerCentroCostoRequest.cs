﻿using ApiV3.Infraestructura.Resultados;
using MediatR;

namespace ApiV3.Dominio.CentroCostos.TareaProgramada
{
    public class ObtenerCentroCostoRequest : IRequest<CommandResult>
    {
        public string Fecha { get; set; }
    }

}
