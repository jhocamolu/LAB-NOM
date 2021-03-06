using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Models;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.NivelCargos.Comandos.Parcial
{
    public class ParcialNivelCargoHandler : IRequestHandler<ParcialNivelCargoRequest, CommandResult>
    {
        private NominaDbContext contexto;

        public ParcialNivelCargoHandler(NominaDbContext contexto)
        {
            this.contexto = contexto;
        }

        public async Task<CommandResult> Handle(ParcialNivelCargoRequest request, CancellationToken cancellationToken)
        {
            try
            {
                NivelCargo nivelCargo = this.contexto.NivelCargos.Find(request.Id);
                if (request.Activo != null)
                {
                    if (request.Activo == true)
                    {
                        nivelCargo.EstadoRegistro = EstadoRegistro.Activo;
                    }
                    else
                    {
                        nivelCargo.EstadoRegistro = EstadoRegistro.Inactivo;
                    }
                }
                if (request.Nombre != null)
                {
                    nivelCargo.Nombre = request.Nombre.ToUpper();
                }

                this.contexto.NivelCargos.Update(nivelCargo);
                await this.contexto.SaveChangesAsync();

                return CommandResult.Success(nivelCargo);
            }
            catch (Exception e)
            {
                return CommandResult.Fail(e.Message);
            }
        }
    }
}
