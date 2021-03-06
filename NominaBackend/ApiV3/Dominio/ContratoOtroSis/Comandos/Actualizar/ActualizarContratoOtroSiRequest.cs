using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace ApiV3.Dominio.ContratoOtroSis.Comandos.Actualizar
{
    public class ActualizarContratoOtroSiRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validacion
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int? Id { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? ContratoId { get; set; }


        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? TipoContratoId { get; set; }


        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? FechaFinalizacion { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? FechaAplicacion { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? CargoDependenciaId { get; set; }


        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? NumeroOtroSi { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        
        [Range(minimum: 1, maximum: 9999999999999, ErrorMessage = ConstantesErrores.Rango + "1 - 9999999999999.")]
        public double? Sueldo { get; set; }


        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? CentroOperativoId { get; set; }


        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$",
            ErrorMessage = ConstantesErrores.Numerico)]
        public int? DivisionPoliticaNivel2Id { get; set; }


        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [MaxLength(300, ErrorMessage = ConstantesErrores.Maximo + "300.")]
        public string Observaciones { get; set; }

        #endregion

        #region validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var contexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                DateTime hoy = DateTime.Today;
                bool HayCambios = false;    // Si hay un cambio en un campo se actualiza en true
                int duracionMaxima = 0;     // Segun tipo del contrato
                int cantidadProrrogas = 0;  // Segun tipo del contrato

                #region Id
                var existeOtroSi = contexto.ContratoOtroSis.Find(Id);
                if (existeOtroSi == null)
                {
                    errores.Add(new ValidationResult("No existe el Id.", new[] { "Id" }));
                    return errores;
                }
                #endregion

                #region ContratoId
                var contratoId = contexto.Contratos.Find(ContratoId);
                if (contratoId == null)
                {
                    errores.Add(new ValidationResult("No existe el ContratoId.", new[] { "ContratoId" }));
                    return errores;
                }
                #endregion

                #region TipoContratoId
                var tipoContratoId = contexto.TipoContratos.Find(TipoContratoId);
                if (tipoContratoId == null)
                {
                    errores.Add(new ValidationResult("No existe un tipo contrato con los datos ingresados.",
                        new[] { "TipoContratoId" }));
                }
                else
                {
                    duracionMaxima = tipoContratoId.DuracionMaxima;
                    cantidadProrrogas = tipoContratoId.CantidadProrrogas;

                    //Valida si hay cambios
                    if (existeOtroSi.TipoContratoId != TipoContratoId)
                    {
                        HayCambios = true;
                    }
                }

                #endregion

                #region FechaFinalizacion
                if (tipoContratoId.TerminoIndefinido == false)
                {
                    if (FechaFinalizacion != null)
                    {

                        if (existeOtroSi.FechaFinalizacion != FechaFinalizacion)
                        {
                            HayCambios = true;
                            if (FechaFinalizacion > existeOtroSi.FechaFinalizacion?.AddDays(duracionMaxima))
                            {
                                errores.Add(new ValidationResult("La fecha de finalización supera el tiempo  permitido para el tipo de contrato.",
                                    new[] { "FechaFinalizacion" }));
                            }
                            else if (FechaFinalizacion < existeOtroSi.FechaFinalizacion)
                            {
                                errores.Add(new ValidationResult("La fecha de finalización del otroSi no puede ser inferior a la fecha de finalización actual.",
                                    new[] { "FechaFinalizacion" }));
                            }
                        }
                    }
                }
                #endregion

                #region CargoDependenciaId
                //Valida si Existe un tipo de Cargo cone el Id
                var VcargoDependenciaId = contexto.CargoDependencias.Find(CargoDependenciaId);
                if (VcargoDependenciaId == null)
                {
                    errores.Add(new ValidationResult("No existe un Cargo-Dependencia con los datos ingresados.",
                        new[] { "CargoDependenciaId" }));
                }
                else
                #endregion

                //NumeroOtroSi No se puede actualizar

                #region Sueldo
                if (existeOtroSi.Sueldo != Sueldo)
                {
                    HayCambios = true;
                    if (existeOtroSi.Sueldo > Sueldo)
                    {
                        errores.Add(new ValidationResult("El sueldo que ingresaste no debe ser menor, que el que actualmente tiene el funcionario.",
                            new[] { "Sueldo" }));
                    }
                }


                #endregion

                #region CentroOperativoId
                //Valida si Existe un CentroOperativo cone el Id
                var centroOperativoId = contexto.CentroOperativos.Where(x => x.Id == CentroOperativoId);
                if (centroOperativoId.FirstOrDefault() == null)
                {
                    errores.Add(new ValidationResult("No existe un centro operativo con los datos ingresados.",
                        new[] { "CentroOperativoId" }));
                }
                else
                {
                    if (existeOtroSi.CentroOperativoId != CentroOperativoId)
                    {
                        HayCambios = true;
                    }
                }
                #endregion

                #region DivisionPoliticaNivel2Id
                var municipio = contexto.DivisionPoliticaNiveles2.Find(DivisionPoliticaNivel2Id);
                if (municipio == null)
                {
                    errores.Add(new ValidationResult("No existe un municipio con los datos ingresados.",
                        new[] { "DivisionPoliticaNivel2Id" }));
                }
                else
                {
                    if (existeOtroSi.DivisionPoliticaNivel2Id != DivisionPoliticaNivel2Id)
                    {
                        HayCambios = true;
                    }
                }
                #endregion

                #region Observaciones
                //Generamos el mesaje si no hay cambios
                if (!HayCambios)
                {
                    errores.Add(new ValidationResult("No hay cambios respecto a las condiciones actuales del contrato.",
                                                    new[] { "ContratoId" }));
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
