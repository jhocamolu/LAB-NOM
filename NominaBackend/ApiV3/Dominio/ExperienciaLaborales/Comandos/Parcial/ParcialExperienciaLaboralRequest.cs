using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.ExperienciaLaborales.Comandos.Parcial
{
    public class ParcialExperienciaLaboralRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int Id { get; set; }

        public bool? Activo { get; set; }

        public int? FuncionarioId { get; set; }

        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(255, ErrorMessage = ConstantesErrores.Maximo + " 255.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + " ]+$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string NombreCargo { get; set; }

        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(255, ErrorMessage = ConstantesErrores.Maximo + " 255.")]
        [RegularExpression(@"^[ " + ConstantesExpresionesRegulares.Numerico + ConstantesExpresionesRegulares.Alfabetico + " ]+$", ErrorMessage = ConstantesErrores.Alfanumerico)]
        public string NombreEmpresa { get; set; }

        [MinLength(7, ErrorMessage = ConstantesErrores.Minimo + " 7.")]
        [MaxLength(10, ErrorMessage = ConstantesErrores.Maximo + " 10.")]
        [RegularExpression(@"^[ " + ConstantesExpresionesRegulares.Numerico + "]+$", ErrorMessage = ConstantesErrores.Numerico)]
        public string Telefono { get; set; }

        [Range(0, 9999999999, ErrorMessage = ConstantesErrores.Rango + "1 - 9999999999.")]
        [RegularExpression(@"^[ " + ConstantesExpresionesRegulares.Numerico + "]+$", ErrorMessage = ConstantesErrores.Numerico)]
        public string Salario { get; set; }

        [MaxLength(255, ErrorMessage = ConstantesErrores.Maximo + " 255.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + " ]+$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string NombreJefeInmediato { get; set; }

        public DateTime? FechaInicio { get; set; }

        public DateTime? FechaFin { get; set; }

        public string FuncionesCargo { get; set; }

        public bool? TrabajaActualmente { get; set; }

        public string MotivoRetiro { get; set; }

        public string Observaciones { get; set; }

        public EstadoInformacionFuncionario? Estado { get; set; }
        public string Justificacion { get; set; }
        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var dbContexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                DateTime fechaVacia = DateTime.MinValue;
                #region Id
                //Valida si elemento Existe
                var elemento = dbContexto.ExperienciaLaborales.FirstOrDefault(x => x.Id == Id);
                if (elemento == null)
                {
                    errores.Add(new ValidationResult(
                       $"No Existe",
                       new[] { "Id" }));
                }
                #endregion
                #region Funcionario 
                if (FuncionarioId != null)
                {
                    var existeFuncionario = dbContexto.Funcionarios.FirstOrDefault(x => x.Id == FuncionarioId);
                    if (existeFuncionario == null)
                    {
                        errores.Add(new ValidationResult(
                           $"No Existe",
                           new[] { "FuncionarioId" }));
                    }
                }
                #endregion
                #region FechaInicio
                if (FechaInicio != null && FechaInicio != fechaVacia)
                {
                    DateTime fechaActual = DateTime.Today;
                    if (FechaInicio > fechaActual)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.FechaNoMayorActual,
                            new[] { "FechaInicio" }));
                    }

                }
                #endregion
                #region FechaFin
                if (FechaFin != null && FechaFin != fechaVacia && FechaInicio != null)
                {
                    if (FechaFin > FechaInicio)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.FechaInicialNoMayorFechaFin,
                            new[] { "FechaFin" }));
                    }
                    if (FechaInicio > FechaFin)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.FechaInicialNoMayorFechaFin,
                            new[] { "FechaInicio" }));
                    }
                }
                #endregion
                #region Estado
                if (Estado == EstadoInformacionFuncionario.Rechazado && Justificacion == null)
                {
                    errores.Add(new ValidationResult(ConstantesErrores.Requerido, new[] { "Justificacion" }));
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