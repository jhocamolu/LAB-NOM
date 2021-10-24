using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Models;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.FuncionarioCentroCostos.Comandos.CrearManual
{
    public class CrearManualFuncionarioCentroCostoHandler : IRequestHandler<CrearManualFuncionarioCentroCostoRequest, CommandResult>
    {
        private readonly NominaDbContext contexto;

        public CrearManualFuncionarioCentroCostoHandler(NominaDbContext contexto)
        {
            this.contexto = contexto;
        }

        public async Task<CommandResult> Handle(CrearManualFuncionarioCentroCostoRequest request, CancellationToken cancellationToken)
        {
            try
            {
                foreach (var item in request.ListaFucnionariosCentroCosto)
                {
                    var funcionarioCentroCosto = new FuncionarioCentroCosto
                    {
                        FuncionarioId = (int)request.FuncionarioId,
                        FormaRegistro = FormaRegistroFuncionarioCentroCosto.Manual,
                        Estado = EstadoFuncionarioCentroCosto.Pendiente,
                        FechaCorte = (DateTime)request.FechaCorte,
                        ActividadCentroCostoId = item.ActividadCentroCostoId
                    };
                    funcionarioCentroCosto.Porcentaje = item.Porcentaje / 100;

                    contexto.FuncionarioCentroCostos.Add(funcionarioCentroCosto);
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
