using ApiV3.Infraestructura.Resultados;
using ApiV3.Servicios.Peticion;
using ApiV3.Support;
using MediatR;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.Reportes.Comandos.NovedadLibranza
{
    public class ReporteNovedadLibranzaHandler : Peticion, IRequestHandler<ReporteNovedadLibranzaRequest, CommandResult>
    {
        const string ALIAS = "NovedadesLibranza";

        public ReporteNovedadLibranzaHandler(IConfiguration configuration, IPeticionService peticion)
        {
            this.configuration = configuration;
            this.peticion = peticion;
        }

        public async Task<CommandResult> Handle(ReporteNovedadLibranzaRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var host = this.configuration.GetValue<string>(Constants.ServiceApi.REPORTES);

                JObject data = await this.ObtenerServicios($"{host}/api/Reportes/{ALIAS}");
                if (data == null) return CommandResult.Fail("Error al conectar con el servicio.", 500);

                if (!data.ContainsKey("alias"))
                {
                    if (data["alias"] == null)
                    {
                        return CommandResult.Fail("El reporte que intentas generar no existe.", 400);
                    }
                }

                Dictionary<string, dynamic> post = new Dictionary<string, dynamic>();

                post.Add("reporteId", data["id"].ToString());
                object parametros = new
                {
                    TipoLiquidacionId = request.TipoLiquidacionId,
                    SubperiodoId = request.SubperiodoId,
                    NominaAnio = request.NominaAnio,
                    NominaMes = request.NominaMes,
                    NominaFechaInicio = request.FechaInicial,
                    NominaFechaFin = request.FechaFinal
                };
                post.Add("parametros", parametros);

                var list = await this.EnviarServicios($"{host}/api/generarReportes", post);
                if (list == null)
                {
                    return CommandResult.Fail("No se ha generado el reporte.");
                }

                return CommandResult.Success(list);
            }
            catch (Exception e)
            {

                return CommandResult.Fail(e.Message);
            }

        }
    }
}
