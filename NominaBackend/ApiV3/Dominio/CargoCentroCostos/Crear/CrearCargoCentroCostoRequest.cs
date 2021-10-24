using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Enumerador;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.CargoCentroCostos.Crear
{
    public class ListaCargoCentroCosto
    {
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int ActividadCentroCostoId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public double Porcentaje { get; set; }
    }
    public class CrearCargoCentroCostoRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? CargoId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? CentroOperativoId { get; set; }


        public DateTime? FechaCorte { get; set; }

        public List<ListaCargoCentroCosto> ListaCargoCentroCosto { get; set; } = new List<ListaCargoCentroCosto>();
        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            var contexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));

            #region Cargo
            var cargo = contexto.Cargos.FirstOrDefault(x => x.Id == CargoId
                                                       && x.EstadoRegistro == EstadoRegistro.Activo);
            if (cargo is null)
            {
                errores.Add(new ValidationResult(ConstantesErrores.NoExiste("cargo"), new[] { "CargoID" }));
                return errores;
            }
            #endregion

            #region ultimoRegistro


            var cargoCentro = contexto.CargoCentroCostos
                                      .OrderByDescending(x => x.FechaCorte)
                                      .FirstOrDefault(x => x.CargoId == CargoId);

            if (cargoCentro != null && FechaCorte < cargoCentro.FechaCorte)
            {
                errores.Add(new ValidationResult("La fecha de inicio de vigencia que ingresaste no puede ser menor que la última fecha de vigencia registrada.",
                                            new[] { "FechaCorte" }));
            }
            #endregion

            #region listoCargo
            if (ListaCargoCentroCosto.Count == 0)
            {
                errores.Add(new ValidationResult(ConstantesErrores.Requerido,
                                               new[] { "ActividadCentroCostoId" }));
                errores.Add(new ValidationResult(ConstantesErrores.Requerido,
                                            new[] { "Porcentaje" }));
            }
            else
            {
                double sumaPorcentaje = 0;
                foreach (var item in ListaCargoCentroCosto)
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
