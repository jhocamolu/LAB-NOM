﻿using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.Idiomas.Comandos.Parcial
{
    public class ParcialIdiomaRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        public int Id { get; set; }

        public bool? Activo { get; set; }

        [MaxLength(2, ErrorMessage = ConstantesErrores.Maximo + " 2.")]
        [RegularExpression(@"[" + ConstantesExpresionesRegulares.Alfabetico + "]+", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string Codigo { get; set; }

        [RegularExpression(@"[" + ConstantesExpresionesRegulares.Alfabetico + ConstantesExpresionesRegulares.Espacio + "]+", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string Nombre { get; set; }
        #endregion

        #region Validaciones Manuales

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();

            try
            {
                var dbContexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                var elemento = dbContexto.Idiomas.SingleOrDefault(x => x.Codigo == Codigo && x.Id != Id);
                if (elemento != null)
                {
                    errores.Add(new ValidationResult(
                       $" El idioma que intentas crear {Codigo} ya existe",
                       new[] { "Codigo" }));
                }
            }
            catch (Exception)
            {

            }
            return errores;
        }
        #endregion
    }
}
