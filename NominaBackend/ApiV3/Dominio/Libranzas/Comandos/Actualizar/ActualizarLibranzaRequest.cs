using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.Libranzas.Comandos.Actualizar
{
    public class LibranzasSubperiodo
    {
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        public int? SubperiodoId { get; set; }
    }

    public class ActualizarLibranzaRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validacion
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int Id { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? FuncionarioId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? EntidadFinancieraId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? FechaInicio { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [Range(minimum: 1, maximum: 999999999, ErrorMessage = ConstantesErrores.Rango + "$1 a $999.999.999,99.")]
        public double? ValorPrestamo { get; set; }

        [Range(minimum: 0, maximum: 1000, ErrorMessage = ConstantesErrores.Rango + "0 a 1000.")]
        public int? NumeroCuotas { get; set; }

        public string Observacion { get; set; }

        public EstadoLibranza? Estado { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [Range(minimum: 1, maximum: 999999999.99, ErrorMessage = ConstantesErrores.Rango + "$1 a $999.999.999,99.")]
        public double? ValorCuota { get; set; }

        //lista Subperiodos Libranza
        public List<LibranzasSubperiodo> LibranzasSubperiodo { get; set; } = new List<LibranzasSubperiodo>();

        #endregion
        #region ValidacionManual
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var dbContexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                #region FechaInicio
                // Consulta Libranza
                var validaFechaInicio = dbContexto.Libranzas.FirstOrDefault(x => x.Id == Id);
                if (validaFechaInicio == null)
                {
                    errores.Add(new ValidationResult(ConstantesErrores.NoExiste("libranza."),
                       new[] { "Id" }));
                }
                else
                {
                    if (FechaInicio < validaFechaInicio.FechaInicio)
                    {
                        errores.Add(new ValidationResult($"La fecha de inicio no puede ser menor a la fecha que ingresaste cuando registraste la libranza.",
                                new[] { "FechaInicio" }));
                    }
                }

                #endregion
                #region FuncionarioId 


                if (FuncionarioId != null)
                {
                    var validaFuncionario = dbContexto.Funcionarios.FirstOrDefault(x => x.Id == FuncionarioId);
                    if (validaFuncionario == null)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.NoExiste("funcionario."),
                           new[] { "FuncionarioId" }));
                    }
                }
                #endregion

                if (EntidadFinancieraId != null)
                {
                    var validaEntidadFinanciera = dbContexto.EntidadFinancieras.FirstOrDefault(x => x.Id == EntidadFinancieraId);
                    if (validaEntidadFinanciera == null)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.NoExiste("entidad financiera."),
                           new[] { "EntidadFinancieraId" }));
                    }
                }
                #region Valor Cuota
                if (ValorCuota > ValorPrestamo)
                {
                    errores.Add(new ValidationResult($"El valor de la cuota no puede ser mayor que el valor del préstamo.",
                                new[] { "ValorCuota" }));

                }
                #endregion
                #region LibranzasSubperiodoLista
                if (LibranzasSubperiodo.Count != 0)
                {
                    foreach (var item in LibranzasSubperiodo)
                    {
                        var subperiodo = dbContexto.SubPeriodos.FirstOrDefault(x => x.Id == item.SubperiodoId);
                        if (subperiodo == null)
                        {
                            errores.Add(new ValidationResult($"{item.SubperiodoId} no es un subperíodo válido.",
                                new[] { "LibranzasSubperiodo" }));
                        }

                    }
                }
                else
                {
                    errores.Add(new ValidationResult("Requerido",
                                new[] { "LibranzasSubperiodo" }));
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
