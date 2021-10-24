using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Models;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.CargoCentroCostos.Crear
{
    public class CrearCargoCentroCostoHandler : IRequestHandler<CrearCargoCentroCostoRequest, CommandResult>
    {
        private readonly NominaDbContext contexto;

        public CrearCargoCentroCostoHandler(NominaDbContext contexto)
        {
            this.contexto = contexto;
        }
        public async Task<CommandResult> Handle(CrearCargoCentroCostoRequest request, CancellationToken cancellationToken)
        {
            try
            {
                foreach (var item in request.ListaCargoCentroCosto)
                {
                    var cargoCentroCosto = new CargoCentroCosto
                    {
                        CargoId = (int)request.CargoId,
                        FechaCorte = (DateTime)request.FechaCorte,
                        ActividadCentroCostoId = item.ActividadCentroCostoId,
                        CentroOperativoId = (int)request.CentroOperativoId
                    };
                    double por = item.Porcentaje / 100;
                    cargoCentroCosto.Porcentaje = item.Porcentaje / 100;

                    contexto.CargoCentroCostos.Add(cargoCentroCosto);
                }
                await contexto.SaveChangesAsync();
                return CommandResult.Success();
            }
            catch (Exception e)
            {
                return CommandResult.Fail(e.Message);
            }
        }
    }
}
