﻿

using MediatR;
using Reclutamiento.Infraestructura.DbContexto;
using Reclutamiento.Infraestructura.Resultados;
using Reclutamiento.Infraestructura.Utilidades;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Reclutamiento.Dominio.HojaDeVidaDocumentos.Comandos.Crear
{
    public class CrearHojaDeVidaDocumentoRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? HojaDeVidaId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? TipoSoporteId { get; set; }

        public string Comentario { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public string Adjunto { get; set; }
        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var contexto = (ReclutamientoDbContext)validationContext.GetService(typeof(ReclutamientoDbContext));

                #region HojaDeVidaId
                var funcionario = contexto.HojaDeVidas.FirstOrDefault(x => x.Id == HojaDeVidaId);
                if (funcionario == null)
                {
                    errores.Add(new ValidationResult(
                        $"No existe una hoja de vida con el valor ingresado.",
                        new[] { "HojaDeVidaId" }));
                }
                #endregion

                #region TipoSoporteId
                var tipoSoportes = contexto.TipoSoportes.FirstOrDefault(x => x.Id == TipoSoporteId);
                if (tipoSoportes == null)
                {
                    errores.Add(new ValidationResult(
                        $"No existe un tipo de soporte con el valor ingresado.",
                        new[] { "TipoSoporteId" }));
                }
                #endregion
            }
            catch (Exception e)
            {
                errores.Add(new ValidationResult(e.Message));
            }
            return errores;
        }
        #endregion
    }
}
