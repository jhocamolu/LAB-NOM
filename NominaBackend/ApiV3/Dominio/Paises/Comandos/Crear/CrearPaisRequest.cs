﻿using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.Paises.Comandos.Crear
{
    public class CrearPaisRequest : IRequest<CommandResult>, IValidatableObject
    {

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(3, ErrorMessage = ConstantesErrores.Maximo + " 3.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]+$", ErrorMessage = ConstantesErrores.Numerico)]
        public string Codigo { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(60, ErrorMessage = ConstantesErrores.Maximo + " 60.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + " ]+$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string Nombre { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(60, ErrorMessage = ConstantesErrores.Maximo + " 100.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + ConstantesExpresionesRegulares.Slash + " ]+$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string Nacionalidad { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errors = new List<ValidationResult>();

            try
            {
                var dbContext = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));

                #region Codigo

                //Valida que código sea único
                var validaUnico = dbContext.Paises.FirstOrDefault(x => x.Codigo == Codigo);
                if (validaUnico != null)
                {
                    errors.Add(new ValidationResult(
                       $"El país que intentas guardar ya existe.",
                       new[] { "Codigo" }));
                }
                //Valida que nombre sea único
                var element = dbContext.Paises.FirstOrDefault(x => x.Nombre == Nombre);
                if (element != null)
                {
                    errors.Add(new ValidationResult(
                       $"El país que intentas guardar ya existe.",
                       new[] { "Nombre" }));
                }

                var validaNacionalidad = dbContext.Paises.FirstOrDefault(x => x.Nacionalidad == Nacionalidad);
                if (validaNacionalidad != null)
                {
                    errors.Add(new ValidationResult(
                       $"La nacionalidad que intentas guardar ya existe.",
                       new[] { "Nacionalidad" }));
                }
                #endregion
            }
            catch (Exception e)
            {
                errors.Add(new ValidationResult(e.Message));
            }

            return errors;
        }
    }
}