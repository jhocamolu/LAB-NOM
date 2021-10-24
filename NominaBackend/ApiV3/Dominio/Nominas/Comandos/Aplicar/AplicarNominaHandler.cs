using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Servicios.Peticion;
using ApiV3.Support;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
///  Antes de aplicar la nomina se procede el envio de la contabilizacion y movimiento de bacos a al API GHesticWebAPi
///  Primero se consultan los registros que pertenecen a la nomina a liquidar y se almacenan en la variable consultaNominaContabilidad
///  
///  Asinto
///  Se consulta en consultaNominaContabilidad los movimientos TipoComprobante Contabilizacion y se almacenan en contabilizacion
///  Se crea la variable aseinto, y se agrag el listado de contabilizacion, 
///  La variable data se carga con los datos de aseinto , este es el json para enviar al api  al endpoint urlAsientoDeDiario
///  
///  Bancos
///  Se consulta en consultaNominaContabilidad los movimientos TipoComprobante Transferencia y se almacenan en contabilizacion
///  Se crea la variable movimientoBanco, y se agraga el listado de Transferencia y el aseinto,
///  movimientoBanco este es el json para enviar al api  al endpoint urlMovimientoBanco
///  Se cosnulta 
/// </summary>
namespace ApiV3.Dominio.Nominas.Comandos.Aplicar
{
    #region Class Contabilidad
    public class DataContabilidad
    {
        public AsientoApi asiento { get; set; }
    }
    public class AsientoApi
    {
        public string paquete { get; set; }
        public string contabilidad { get; set; }
        public string notas { get; set; }
        public double totalControlLocal { get; set; }
        public string dependencia { get; set; }
        public List<AnotacionesApi> anotaciones { get; set; }
    }
    public class AnotacionesApi
    {
        public string nit { get; set; }
        public string centroCosto { get; set; }
        public string cuentaContable { get; set; }
        public string fuente { get; set; }
        public string referencia { get; set; }
        public double debitoLocal { get; set; }
        public double creditoLocal { get; set; }
        public string TipoComprobante { get; set; }
    }
    #endregion

    #region Class Banco
    public class DataTransferencia
    {
        public string cuentaBanco { get; set; }
        public string tipoDocumento { get; set; }
        public short subtipo { get; set; }
        public string referencia { get; set; }
        public double monto { get; set; }
        public List<MovimientosApi> movimientos
        { get; set; }
        public AsientoApi asiento { get; set; }
    }
    public class MovimientosApi
    {
        public string nit { get; set; }
        public string cuentaDestino { get; set; }
        public double? monto { get; set; }
        public string concepto { get; set; }
    }
    #endregion


    public class AplicarNominaHandler : IRequestHandler<AplicarNominaRequest, CommandResult>
    {
        private readonly NominaDbContext contexto;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IConfiguration configuration;
        private readonly IPeticionService peticionService;

        public AplicarNominaHandler(NominaDbContext contexto, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, IPeticionService peticionService)
        {
            this.contexto = contexto;
            this.httpContextAccessor = httpContextAccessor;
            this.configuration = configuration;
            this.peticionService = peticionService;
        }

        public async Task<CommandResult> Handle(AplicarNominaRequest request, CancellationToken cancellationToken)
        {
            try
            {
                //Constantes envio Api
                string _FURNTE = "GHestic";
                string _REFERENCIA = "CN";
                string _PAQUETE = "CN";
                string _CONTABILIDAD = "Corporativo";
                string _NOTAS = "Datos exportados desde GHestic";
                string _TIPODOCUEMNTO = "CHQ";

                string api = this.configuration.GetValue<string>(Constants.InformacionSoftlandSicon.Api).ToString();
                var urlAsientoDeDiario = $"{api}/api/AsientoDeDiario/Create";
                var urlMovimientoBanco = $"{api}/api/MovimientoBanco/Create";
                var tokens = httpContextAccessor.HttpContext.Request.Headers["JwtToken"][0];

                #region Consulta general
                var consultaNominaContabilidad = (from nominaFuncionario in this.contexto.NominaFuncionarios
                                                  where nominaFuncionario.NominaId == request.Id
                                                  && nominaFuncionario.EstadoRegistro == EstadoRegistro.Activo
                                                  join contabilidad in contexto.NominaContabilidades on nominaFuncionario.Id equals contabilidad.NominaFuncionarioId
                                                  where contabilidad.EstadoRegistro == EstadoRegistro.Activo
                                                  && contabilidad.TipoComprobante != Convert.ToString(TipoComprobante.Reversion)
                                                  join cuentaContable in contexto.CuentaContables on contabilidad.CuentaContableId equals cuentaContable.Id
                                                  where cuentaContable.EstadoRegistro == EstadoRegistro.Activo
                                                  select new AnotacionesApi
                                                  {
                                                      nit = contabilidad.Nit,
                                                      centroCosto = contabilidad.CentroCostoId.ToString(),
                                                      cuentaContable = cuentaContable.Cuenta,
                                                      fuente = _FURNTE,
                                                      referencia = _REFERENCIA,
                                                      debitoLocal = (double)contabilidad.Debito,
                                                      creditoLocal = (double)contabilidad.Credito,
                                                      TipoComprobante = contabilidad.TipoComprobante
                                                  });
                #endregion

                #region  Contabilizacion urlAsientoDeDiario
                var contabilizacion = await (from conta in consultaNominaContabilidad
                                             where conta.TipoComprobante == Convert.ToString(TipoComprobante.Contabilizacion)
                                             join centroCosto in contexto.CentroCostos on Convert.ToInt32(conta.centroCosto) equals centroCosto.Id
                                             where centroCosto.EstadoRegistro == EstadoRegistro.Activo
                                             select new AnotacionesApi
                                             {
                                                 nit = conta.nit,
                                                 centroCosto = centroCosto.Codigo,
                                                 cuentaContable = conta.cuentaContable,
                                                 fuente = _FURNTE,
                                                 referencia = _REFERENCIA,
                                                 debitoLocal = conta.debitoLocal,
                                                 creditoLocal = conta.creditoLocal,
                                             }).ToListAsync();


                var asiento = new AsientoApi
                {
                    paquete = _PAQUETE,
                    contabilidad = _CONTABILIDAD,
                    notas = _NOTAS,
                    totalControlLocal = contabilizacion.Sum(x => x.debitoLocal),
                    dependencia = "",
                    anotaciones = contabilizacion
                };

                DataContabilidad data = new DataContabilidad { asiento = asiento };


                var response = await peticionService.Post(urlAsientoDeDiario, data);
                response.Headers.Add("jwttoken", tokens.ToString());

                if (response.IsSuccessStatusCode == false)
                {
                    var errorRespon = response.Content.ReadAsStringAsync();
                    var strJSon = JsonConvert.DeserializeObject(errorRespon.Result);

                    var str = strJSon.ToString();

                    return CommandResult.Fail(str, 400);
                }
                #endregion

                #region Trasnferencias urlMovimientoBanco
                //partida debido varias lineas
                var transferencia = await (from banco in consultaNominaContabilidad
                                           where banco.TipoComprobante == Convert.ToString(TipoComprobante.Transferencia)
                                           && banco.debitoLocal > 0
                                           select new MovimientosApi
                                           {
                                               nit = banco.nit,
                                               cuentaDestino = banco.cuentaContable,
                                               monto = banco.debitoLocal,
                                               concepto = banco.TipoComprobante
                                           }).ToListAsync();
                //partida credito una linea
                var movimientoBanco = new DataTransferencia
                {
                    tipoDocumento = _TIPODOCUEMNTO,
                    subtipo = 0,
                    referencia = _REFERENCIA,
                    asiento = asiento,
                    cuentaBanco = "1105010101",
                    monto = (double)transferencia.Sum(x => x.monto),
                    movimientos = transferencia
                };

                var responsetrans = await peticionService.Post(urlMovimientoBanco, movimientoBanco);
                responsetrans.Headers.Add("jwttoken", tokens.ToString());

                if (responsetrans.IsSuccessStatusCode == false)
                {
                    var errorRespon = responsetrans.Content.ReadAsStringAsync();
                    var strJSon = JsonConvert.DeserializeObject(errorRespon.Result);

                    var str = strJSon.ToString();

                    return CommandResult.Fail(str, 400);
                }
                #endregion

                #region Aplicar Nomina
                var nomina = contexto.Nominas.FirstOrDefault(x => x.Id == request.Id);
                nomina.Estado = EstadoNomina.Aplicada;

                contexto.Nominas.Update(nomina);
                await contexto.SaveChangesAsync();
                #endregion

                return CommandResult.Success(nomina);
            }
            catch (Exception e)
            {
                return CommandResult.Fail(e.Message);
            }
        }
    }
}
