using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.FuncionarioCentroCostos.Comandos.CrearManual
{

    public class ListaFucnionariosCentroCosto
    {
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int ActividadCentroCostoId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public double Porcentaje { get; set; }
    }

    public class CrearManualFuncionarioCentroCostoRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? FuncionarioId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? FechaCorte { get; set; }

        public List<ListaFucnionariosCentroCosto> ListaFucnionariosCentroCosto { get; set; } = new List<ListaFucnionariosCentroCosto>();
        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            var contexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));

            #region Funcionario
            var funcionario = contexto.Funcionarios.FirstOrDefault(x => x.Id == FuncionarioId
                                                                    && x.EstadoRegistro == EstadoRegistro.Activo);
            if (funcionario is null)
            {
                errores.Add(new ValidationResult(ConstantesErrores.NoExiste("funcionario"),
                    new[] { "FuncionarioId" }));
                return errores;
            }
            #endregion

            #region ultimoRegistro
            var FuncionarioCentroCostos = contexto.FuncionarioCentroCostos
                                                  .OrderByDescending(x => x.FechaCorte)
                                                  .FirstOrDefault(x => x.FuncionarioId == FuncionarioId
                                                                && x.EstadoRegistro == EstadoRegistro.Activo);
            if (FuncionarioCentroCostos != null && FuncionarioCentroCostos.Estado == EstadoFuncionarioCentroCosto.Pendiente)
            {
                errores.Add(new ValidationResult("El usuario que ingresaste ya tiene una distribución de costos registrada.",
                                            new[] { "FuncionarioId" }));
                return errores;
            }
            if (FuncionarioCentroCostos != null && FechaCorte < FuncionarioCentroCostos.FechaCorte)
            {
                errores.Add(new ValidationResult("La fecha de inicio de vigencia que ingresaste no puede ser menor que la última fecha de vigencia registrada.",
                                            new[] { "FechaCorte" }));
            }
            #endregion

            #region ListaFuncionario
            if (ListaFucnionariosCentroCosto.Count == 0)
            {
                errores.Add(new ValidationResult(ConstantesErrores.Requerido,
                                               new[] { "FechaCorte" }));
                errores.Add(new ValidationResult(ConstantesErrores.Requerido,
                                            new[] { "Porcentaje" }));
            }
            else
            {
                double sumaPorcentaje = 0;
                foreach (var item in ListaFucnionariosCentroCosto)
                {

                    var actividadCentroCostos = contexto.ActividadCentroCostos
                                        .FirstOrDefault(x => x.Id == item.ActividadCentroCostoId);
                    if (actividadCentroCostos is null)
                    {
                        errores.Add(new ValidationResult(
                                    ConstantesErrores.NoExiste($"Actividad centro costo {item.ActividadCentroCostoId}"),
                                    new[] { "snackError" }));
                    }
                    sumaPorcentaje += item.Porcentaje;
                }

                if (sumaPorcentaje < 100)
                {
                    errores.Add(new ValidationResult("No se ha completado el 100% de la distribución de costos, por favor revise.",
                                            new[] { "snackError" }));
                }
                else if (sumaPorcentaje > 100)
                {
                    errores.Add(new ValidationResult("El porcentaje que ingresaste excede el 100% de la distribución de costos, por favor revise.",
                                           new[] { "snackError" }));
                }
            }
            #endregion
            return errores;
        }
        #endregion
    }
}
