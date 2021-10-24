﻿using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.DeduccionRetefuentes.Comandos.Parcial
{
    public class ParcialDeduccionRetefuenteRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int Id { get; set; }
        public bool? Activo { get; set; }
        #endregion

        #region Validacion Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var contexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                #region Id
                var existeId = contexto.DeduccionRetefuentes.FirstOrDefault(x => x.Id == Id);
                if (existeId == null)
                {
                    errores.Add(new ValidationResult(ConstantesErrores.NoExiste("deduccion retefuente"),
                        new[] { "snack" }));
                    return errores;
                }
                else
                {
                    var vigencia = contexto.AnnoVigencias.FirstOrDefault(x => x.Id == existeId.AnnoVigenciaId);
                    if (vigencia.Estado != EstadoAnnoVigencia.Vigente)
                    {
                        errores.Add(new ValidationResult("Solo puedes editar una deducción de retefuente para para el año vigente.",
                            new[] { "snack" }));
                    }
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
