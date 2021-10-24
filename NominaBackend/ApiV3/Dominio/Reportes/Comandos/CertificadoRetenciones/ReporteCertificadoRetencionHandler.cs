﻿using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using ApiV3.Models;
using ApiV3.Servicios.Peticion;
using ApiV3.Support;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.Reportes.Comandos.CertificadoRetenciones
{
    public class ReporteCertificadoRetencionHandler : IRequestHandler<ReporteCertificadoRetencionRequest, CommandResult>
    {
        private readonly NominaDbContext contexto;
        private IConfiguration configuration;
        private readonly IHttpContextAccessor httpContextAccessor;
        private IPeticionService peticion;
        private readonly string host;
        const string ALIAS = "CertificadoRetencion";

        public ReporteCertificadoRetencionHandler(IConfiguration configuration, IPeticionService peticion, NominaDbContext contexto, IHttpContextAccessor httpContextAccessor)
        {
            this.contexto = contexto;
            this.configuration = configuration;
            this.peticion = peticion;
            this.httpContextAccessor = httpContextAccessor;
            this.host = this.configuration.GetValue<string>(Constants.ServiceApi.REPORTES);
        }

        public async Task<CommandResult> Handle(ReporteCertificadoRetencionRequest request, CancellationToken cancellationToken)
        {

            try
            {
                // consultar si existe alias del reporte
                JObject data = await this.ObtenerServicios($"{host}/api/Reportes/{ALIAS}");
                if (data == null) return CommandResult.Fail("Error al conectar con el servicio.", 500);

                if (!data.ContainsKey("alias"))
                {
                    if (data["alias"] == null)
                    {
                        return CommandResult.Fail("El reporte que intentas generar no existe.", 400);
                    }
                }

                // creacion del elemento post para enviar tipo formato JSON  clave - valor
                Dictionary<string, dynamic> post = new Dictionary<string, dynamic>();

                // Id del reporte
                post.Add("reporteId", data["id"].ToString());
                object parametros;

                Funcionario funcionario = InformacionToken.ObtenerInformacionFuncionario(httpContextAccessor.HttpContext.Request.Headers["JwtToken"], contexto);

                // parametros del reporte
                parametros = new
                {
                    FuncionarioId = funcionario.Id,
                    Anio = request.Annio
                };

                post.Add("parametros", parametros);

                //enviar y obtener ruta del reporte
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
        /// <summary>
        /// Obtener informacion get
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private async Task<JObject> ObtenerServicios(string url)
        {
            try
            {
                HttpResponseMessage httpResponse = await this.peticion.Get(url);
                if (!httpResponse.IsSuccessStatusCode) return null;
                return JObject.Parse(await httpResponse.Content.ReadAsStringAsync());
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        /// <summary>
        /// Enviar informacion post
        /// </summary>
        /// <param name="url"></param>
        /// <param name="param"></param>
        /// <returns></returns>
        private async Task<JObject> EnviarServicios(string url, object param)
        {
            try
            {
                HttpResponseMessage httpResponse = await this.peticion.Post(url, param);
                if (!httpResponse.IsSuccessStatusCode) return JObject.Parse(await httpResponse.Content.ReadAsStringAsync());
                return JObject.Parse(await httpResponse.Content.ReadAsStringAsync());
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}