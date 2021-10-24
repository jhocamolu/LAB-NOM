using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Filtros;
using ApiV3.Infraestructura.Utilidades;
using ApiV3.Models;
using Microsoft.AspNet.OData;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ApiV3.Controllers.Odata
{
    public class CargoCentroCostosController : ControllerBase
    {
        private readonly NominaDbContext contexto;

        public CargoCentroCostosController(NominaDbContext contexto)
        {
            this.contexto = contexto;
        }
        // GET: odata/CargoCentroCostos
        [TypeFilter(typeof(JwtValidationActionFilter), Arguments = new object[] { ConstantesPermisos.FuncionarioDatoActuales_Listar })]
        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 50)]
        public IQueryable<CargoCentroCosto> Get()
        {
            return this.contexto.CargoCentroCostos;


        }

        // GET: odata/CargoCentroCostos/5
        [TypeFilter(typeof(JwtValidationActionFilter), Arguments = new object[] { ConstantesPermisos.FuncionarioDatoActuales_Obtener })]
        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 10)]
        public SingleResult<CargoCentroCosto> Get([FromODataUri] int key)
        {
            IQueryable<CargoCentroCosto> cargoCentroCosto = this.contexto.CargoCentroCostos.Where(p => p.Id == key);
            return SingleResult.Create(cargoCentroCosto);
        }
    }
}
