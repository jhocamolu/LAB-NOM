using ApiV3.Dominio.CargoCentroCostos.Crear;
using ApiV3.Infraestructura.Filtros;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

/// @author Jesus Albeiro Gaviria
/// @email  desarrollador5@alcanosesp.com
/// @Description HU111

namespace ApiV3.Controllers.Rest
{
    [Route("api/[controller]")]
    [ApiController]
    public class CargoCentroCostosController : ControllerBase
    {
        private readonly IMediator mediador;
        public CargoCentroCostosController(IMediator mediador)
        {
            this.mediador = mediador;
        }

        #region POST CREAE MANUAL
        // POST: api/CargoCentroCosto
        [TypeFilter(typeof(JwtValidationActionFilter), Arguments = new object[] { ConstantesPermisos.FuncionarioCentroCostos_CrearManual })]
        [HttpPost]
        public async Task<ActionResult> Crear([FromBody] CrearCargoCentroCostoRequest comando)
        {
            var resultado = await mediador.Send(comando);
            if (resultado.IsSuccess)
            {
                return Ok(resultado.Data);
            }
            return StatusCode(500, new
            {
                Message = resultado.FailureReason
            });
        }
        #endregion
    }
}
