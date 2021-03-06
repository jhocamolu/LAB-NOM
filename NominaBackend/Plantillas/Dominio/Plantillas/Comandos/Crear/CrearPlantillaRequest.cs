using MediatR;
using Plantillas.Dominio.Enumerador;
using Plantillas.Dominio.Utilidades;
using Plantillas.Infraestructura.Resultados;
using Plantillas.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Plantillas.Dominio.Plantillas.Comandos.Crear
{
    public class CrearPlantillaRequest : IRequest<CommandResult>, IValidatableObject
    {
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        [MinLength(1, ErrorMessage = ConstantesErrores.Minimo + " 1.")]
        [MaxLength(100, ErrorMessage = ConstantesErrores.Maximo + " 100.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + ConstantesExpresionesRegulares.Espacio + ConstantesExpresionesRegulares.SignosPuntuacion + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string Nombre { get; set; }

        public string Version { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public DateTime? FechaVigencia { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int GrupoDocumentoId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int DocumentoId { get; set; }

        public int? EncabezadoId { get; set; }

        public int? PiePaginaId { get; set; }

        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public string CuerpoDocumento { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var dbContexto = (PlantillasDbContext)validationContext.GetService(typeof(PlantillasDbContext));

                var elemento = dbContexto.Plantillas.FirstOrDefault(x => x.Nombre == Nombre);
                if (elemento != null)
                {
                    errores.Add(new ValidationResult(
                        $"El nombre de la plantilla que intentas guardar ya existe.",
                        new[] { "Nombre" }));
                }

                var grupoDocumento = dbContexto.GrupoDocumentos.FirstOrDefault(x => x.Id == GrupoDocumentoId);
                if (grupoDocumento == null)
                {
                    errores.Add(new ValidationResult(
                        $"El grupo de documentos que intentas guardar no existe.",
                        new[] { "GrupoDocumentoId" }));
                }

                var documento = dbContexto.Documentos.FirstOrDefault(x => x.Id == DocumentoId);
                if (documento == null)
                {
                    errores.Add(new ValidationResult(
                        $"El documento que intentas guardar no existe.",
                        new[] { "DocumentoId" }));
                }

                if (EncabezadoId != null)
                {

                    var existeEncabezado = dbContexto.ComplementoPlantillas.FirstOrDefault(x => x.Id == EncabezadoId && x.Tipo == TipoComplemento.Encabezado);
                    if (existeEncabezado == null)
                    {
                        errores.Add(new ValidationResult(
                            $"El elemento que intentas guardar no pertenece al complemento encabezado.",
                            new[] { "EncabezadoId" }));
                    }
                }

                if (PiePaginaId != null)
                {
                    var existePiePagina = dbContexto.ComplementoPlantillas.FirstOrDefault(x => x.Id == PiePaginaId && x.Tipo == TipoComplemento.PiePagina);
                    if (existePiePagina == null)
                    {
                        errores.Add(new ValidationResult(
                            $"El elemento que intentas guardar no pertenece al complemento pie de página.",
                            new[] { "PiePaginaId" }));
                    }
                }
            }
            catch (Exception e)
            {
                errores.Add(new ValidationResult(e.Message));
            }
            return errores;
        }
    }
}
