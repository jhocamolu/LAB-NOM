using ApiV3.Infraestructura.Resultados;
using MediatR;

namespace ApiV3.Dominio.CargoPresupuestos.Comandos.Eliminar
{
    public class EliminarCargoPresupuestoRequest : IRequest<CommandResult>
    {
        public int Id { get; set; }
    }
}
