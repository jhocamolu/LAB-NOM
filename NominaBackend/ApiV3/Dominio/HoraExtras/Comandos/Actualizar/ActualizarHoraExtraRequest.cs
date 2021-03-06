using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.HoraExtras.Comandos.Actualizar
{
    public class ActualizarHoraExtraRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int Id { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? FuncionarioId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? Fecha { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [Range(minimum: 1, maximum: 100.000, ErrorMessage = ConstantesErrores.Rango + "1 - 100.")]
        public decimal Cantidad { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? TipoHoraExtraId { get; set; }

        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var dbContexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));

                var validaEstado = dbContexto.HoraExtras.FirstOrDefault(x => x.Id == Id &&
                                                                             (x.Estado == EstadoHoraExtra.Aplicada ||
                                                                              x.FormaRegistro == FormaRegistroHoraExtra.Automatico ||
                                                                              x.EstadoRegistro != EstadoRegistro.Activo)
                                                                            );
                if (validaEstado != null)
                {
                    errores.Add(new ValidationResult(
                        $"El registro no puede ser modificado en el estado en el que se encuentra.",
                        new[] { "snack" }));
                }
                else
                {
                    #region FuncionarioId
                    //Valida que nivel Cargo existte
                    var existeFuncionarioId = dbContexto.Funcionarios.FirstOrDefault(x => x.Id == FuncionarioId);
                    if (existeFuncionarioId == null)
                    {
                        errores.Add(new ValidationResult(
                            $"El funcionario no existe.",
                            new[] { "FuncionarioId" }));
                    }
                    #endregion
                    #region TipoHoraExtraId
                    //Valida que nivel Cargo existte
                    var existeTipoHoraExtraId = dbContexto.TipoHoraExtras.FirstOrDefault(x => x.Id == TipoHoraExtraId);
                    if (existeTipoHoraExtraId == null)
                    {
                        errores.Add(new ValidationResult(
                            $"El tipo de hora extra no existe.",
                            new[] { "TipoHoraExtraId" }));
                    }
                    #endregion
                    #region Fecha
                    var fecha = (DateTime)Fecha;
                    if (fecha.Date > DateTime.Today.Date)
                    {
                        errores.Add(new ValidationResult(
                            $"La fecha que intentas ingresar no puede ser mayor que la fecha actual.",
                            new[] { "Fecha" }));
                    }
                    #endregion
                }
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
