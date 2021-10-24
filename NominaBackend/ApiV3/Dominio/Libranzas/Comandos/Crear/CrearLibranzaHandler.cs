﻿using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Models;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ApiV3.Dominio.Libranzas.Comandos.Crear
{
    public class CrearLibranzaHandler : IRequestHandler<CrearLibranzaRequest, CommandResult>
    {
        private readonly NominaDbContext contexto;

        public CrearLibranzaHandler(NominaDbContext contexto)
        {
            this.contexto = contexto;
        }

        public async Task<CommandResult> Handle(CrearLibranzaRequest request, CancellationToken cancellationToken)
        {
            try
            {
                Libranza libranza = new Libranza();
                libranza.FuncionarioId = (int)request.FuncionarioId;
                libranza.EntidadFinancieraId = (int)request.EntidadFinancieraId;
                libranza.FechaInicio = (DateTime)request.FechaInicio;
                libranza.ValorPrestamo = (double)request.ValorPrestamo;
                if (request.FechaInicio > DateTime.Today)
                {
                    libranza.Estado = EstadoLibranza.Pendiente;
                }
                else
                {
                    libranza.Estado = EstadoLibranza.Vigente;
                }

                if (request.NumeroCuotas != null)
                {
                    libranza.NumeroCuotas = (int)request.NumeroCuotas;
                }
                if (request.Observacion != null)
                {
                    libranza.Observacion = request.Observacion;
                }
                if (request.ValorCuota != null)
                {
                    libranza.ValorCuota = (double)request.ValorCuota;
                }
                contexto.Libranzas.Add(libranza);
                await contexto.SaveChangesAsync();

                // Creamos los subperíodos para la libranza
                foreach (var item in request.LibranzasSubperiodo)
                {
                    LibranzaSubperiodo libranzaSubperiodo = new LibranzaSubperiodo();
                    libranzaSubperiodo.LibranzaId = libranza.Id;
                    libranzaSubperiodo.SubPeriodoId = (int)item.SubperiodoId;

                    this.contexto.LibranzaSubperiodos.Add(libranzaSubperiodo);
                    await this.contexto.SaveChangesAsync();
                }
                libranza.LibranzaSubperiodos = null;
                return CommandResult.Success(libranza);
            }
            catch (Exception e)
            {
                return CommandResult.Fail(e.Message);
            }
        }
    }
}
