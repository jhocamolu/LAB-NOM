using ApiV3.Infraestructura.DbContexto;
using ApiV3.Infraestructura.Resultados;
using ApiV3.Infraestructura.Utilidades;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using static ApiV3.Infraestructura.Utilidades.DigitoVerificacion;

/// <summary>
/// Clase encargada de realizar actualizaciones parciales a la entidad Funcionarios.
/// </summary>

namespace ApiV3.Dominio.Funcionarios.Comandos.Parcial
{
    public class ParcialFuncionarioRequest : IRequest<CommandResult>, IValidatableObject
    {
        #region Validaciones
        [Required(ErrorMessage = ConstantesErrores.Requerido)]
        public int Id { get; set; }
        #region DATOSBASICOS
        #region PrimerNombre
        [MaxLength(100, ErrorMessage = ConstantesErrores.Maximo + "100.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico +
                                  ConstantesExpresionesRegulares.Espacio + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string PrimerNombre { get; set; }
        #endregion

        #region SegundoNombre
        [MaxLength(100, ErrorMessage = ConstantesErrores.Maximo + "100.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico +
                                  ConstantesExpresionesRegulares.Espacio + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string SegundoNombre { get; set; }
        #endregion

        #region PrimerApellido
        [MaxLength(100, ErrorMessage = ConstantesErrores.Minimo + "100.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico +
                                  ConstantesExpresionesRegulares.Espacio + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string PrimerApellido { get; set; }
        #endregion

        #region SegundoApellido        
        [MaxLength(100, ErrorMessage = ConstantesErrores.Minimo)]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico +
                                  ConstantesExpresionesRegulares.Espacio + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string SegundoApellido { get; set; }
        #endregion


        public int? SexoId { get; set; }


        public int? EstadoCivilId { get; set; }


        public int? OcupacionId { get; set; }


        public bool? Pensionado { get; set; }
        #endregion

        #region NACIMIENTO
        public DateTime? FechaNacimiento { get; set; }


        public int? DivisionPoliticaNivel2OrigenId { get; set; }
        #endregion

        #region IDENTIFICACION
        public int? TipoDocumentoId { get; set; }


        [MaxLength(15, ErrorMessage = ConstantesErrores.Maximo + "15.")]
        public string NumeroDocumento { get; set; }


        [DataType(DataType.Date)]
        public DateTime? FechaExpedicionDocumento { get; set; }


        public int? DivisionPoliticaNivel2ExpedicionDocumentoId { get; set; }


        [MaxLength(15, ErrorMessage = ConstantesErrores.Maximo + "15.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        public string Nit { get; set; }

        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        public int? DigitoVerificacion { get; set; }
        #endregion

        #region RESIDENCIA
        public int? DivisionPoliticaNivel2ResidenciaId { get; set; }


        [MaxLength(15, ErrorMessage = ConstantesErrores.Maximo + "15.")]
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        public string Celular { get; set; }


        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        public string TelefonoFijo { get; set; }


        public int? TipoViviendaId { get; set; }

        [MaxLength(255, ErrorMessage = ConstantesErrores.Maximo + "255.")]
        public string Direccion { get; set; }
        #endregion

        #region LIBRETAMILITAR
        public int? ClaseLibretaMilitarId { get; set; }


        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Numerico + "]*$", ErrorMessage = ConstantesErrores.Numerico)]
        [MaxLength(15, ErrorMessage = ConstantesErrores.Maximo + "15")]
        public string NumeroLibreta { get; set; }


        public int? Distrito { get; set; }
        #endregion

        #region LICENCIACONDUCCION
        public int? LicenciaConduccionAId { get; set; }

        [DataType(DataType.Date)]
        public DateTime? LicenciaConduccionAFechaVencimiento { get; set; }


        public int? LicenciaConduccionBId { get; set; }

        [DataType(DataType.Date)]
        public DateTime? LicenciaConduccionBFechaVencimiento { get; set; }


        public int? LicenciaConduccionCId { get; set; }

        [DataType(DataType.Date)]
        //[DisplayFormat(DataFormatString = "{0:DD/MM/AAAA}.", ApplyFormatInEditMode = true)]
        public DateTime? LicenciaConduccionCFechaVencimiento { get; set; }
        #endregion

        #region OTROS
        [RegularExpression(@"^[" + ConstantesExpresionesRegulares.Alfabetico + "]*$", ErrorMessage = ConstantesErrores.Alfabetico)]
        public string TallaCamisa { get; set; }


        [MaxLength(2, ErrorMessage = ConstantesErrores.Minimo + "2.")]
        public string TallaPantalon { get; set; }

        [Range(minimum: 1, maximum: 99, ErrorMessage = ConstantesErrores.Rango + ("1 -99."))]
        public double? NumeroCalzado { get; set; }


        public bool? UsaLentes { get; set; }


        public int? TipoSangreId { get; set; }



        [EmailAddress(ErrorMessage = ConstantesErrores.CorreoElectronico)]
        public string CorreoElectronicoPersonal { get; set; }



        [EmailAddress(ErrorMessage = ConstantesErrores.CorreoElectronico)]
        public string CorreoElectronicoCorporativo { get; set; }

        public string Adjunto { get; set; }
        #endregion

        #region Estado Registro
        public bool? Activo { get; set; }
        #endregion
        #endregion

        #region Validaciones Manuales
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            List<ValidationResult> errores = new List<ValidationResult>();
            try
            {
                var contexto = (NominaDbContext)validationContext.GetService(typeof(NominaDbContext));
                //Variable fecha para validaciones
                DateTime fechaActual = DateTime.Today;

                #region Id
                var existe = contexto.Funcionarios.FirstOrDefault(x => x.Id == Id);
                if (existe == null)
                {
                    errores.Add(new ValidationResult($"No existe.", new[] { "id" }));
                    return errores;
                }
                #endregion

                #region DATOSBASICOS
                #region SexoId
                if (SexoId != null)
                {
                    var genero = contexto.Sexos.FirstOrDefault(x => x.Id == SexoId);
                    if (genero == null)
                    {
                        errores.Add(new ValidationResult("El sexo que intentas guardar no existe.", new[] { "SexoId" }));
                    }
                }
                #endregion

                #region EstadoCivilId
                if (EstadoCivilId != null)
                {
                    var estadoCivil = contexto.EstadoCiviles.FirstOrDefault(x => x.Id == EstadoCivilId);
                    if (estadoCivil == null)
                    {
                        errores.Add(new ValidationResult("El estado civil que intentas guardar no existe.", new[] { "EstadoCivilId" }));
                    }
                }
                #endregion

                #region OcupacionId
                if (OcupacionId != null)
                {
                    var ocupacion = contexto.Ocupaciones.FirstOrDefault(x => x.Id == OcupacionId);
                    if (ocupacion == null)
                    {
                        errores.Add(new ValidationResult("La ocupación que intentas guardar no existe.", new[] { "OcupacionId" }));
                    }
                }
                #endregion
                #endregion

                #region NACIMINETO
                #region FechaNacimiento
                if (FechaNacimiento != null)
                {
                    if (FechaNacimiento > fechaActual)
                    {
                        errores.Add(new ValidationResult("La fecha de nacimiento debe ser menor a la fecha actual.",
                            new[] { "FechaNacimiento" }));
                    }
                    else if (FechaNacimiento > fechaActual.AddYears(-10))
                    {
                        errores.Add(new ValidationResult("El funcionario debe tener más de diez años.",
                            new[] { "FechaNacimiento" }));
                    }
                    else if (FechaNacimiento < fechaActual.AddYears(-100))
                    {
                        errores.Add(new ValidationResult("El funcionario no debe tener más de cien años.",
                            new[] { "FechaNacimiento" }));
                    }
                }
                #endregion

                #region DivisionPoliticaNivel2OrigenId
                if (DivisionPoliticaNivel2OrigenId != null)
                {
                    var DivisionPoliticaNivel2Origen = contexto.DivisionPoliticaNiveles2.FirstOrDefault(x => x.Id == DivisionPoliticaNivel2OrigenId);
                    if (DivisionPoliticaNivel2Origen == null)
                    {
                        errores.Add(new ValidationResult("El DivisionPoliticaNivel2 de origen que intentas guardar no existe.",
                            new[] { "DivisionPoliticaNivel2OrigenId" }));
                    }
                }
                #endregion
                #endregion

                #region IDENTIFICACION
                #region TipoDocumentoId
                if (TipoDocumentoId != null)
                {
                    var tipoDocumento = contexto.TipoDocumentos.FirstOrDefault(x => x.Id == TipoDocumentoId);
                    if (tipoDocumento == null)
                    {
                        errores.Add(new ValidationResult("El tipo de documento que intentas guardar no existe.",
                            new[] { "TipoDocumentoId" }));
                    }
                }
                #endregion

                #region NumeroDocumento
                if (NumeroDocumento != null)
                {
                    var numeroDocumento = contexto.Funcionarios.FirstOrDefault(x => x.Id != Id && x.NumeroDocumento == NumeroDocumento);
                    if (numeroDocumento != null)
                    {
                        errores.Add(new ValidationResult("El número de documento que intentas guardar ya existe.",
                            new[] { "NumeroDocumento" }));
                    }
                }
                #endregion

                #region FechaExpedicionDocumento
                if (FechaExpedicionDocumento != null)
                {
                    if (FechaExpedicionDocumento > fechaActual)
                    {
                        errores.Add(new ValidationResult("La fecha de expedición del documento de identidad que intentas ingresar no debe ser mayor a la fecha actual.",
                            new[] { "FechaExpedicionDocumento" }));
                    }
                }
                #endregion
                //DateTime FechaExpedicionDocumento { get; set; }

                #region DivisionPoliticaNivel2ExpedicionDocumentoId
                if (DivisionPoliticaNivel2ExpedicionDocumentoId != null)
                {
                    var DivisionPoliticaNivel2ExpedicionDocumento = contexto.DivisionPoliticaNiveles2
                                                               .FirstOrDefault(x => x.Id == DivisionPoliticaNivel2ExpedicionDocumentoId);
                    if (DivisionPoliticaNivel2ExpedicionDocumento == null)
                    {
                        errores.Add(new ValidationResult("El DivisionPoliticaNivel2 de expedición del documento que intentas guardar no existe.",
                            new[] { "DivisionPoliticaNivel2ExpedicionDocumentoId" }));
                    }
                }
                #endregion

                #region Nit
                if (Nit != null)
                {
                    var nit = contexto.Funcionarios.FirstOrDefault(x => x.Id != Id && x.Nit == Nit);
                    if (nit != null)
                    {
                        errores.Add(new ValidationResult("El número de NIT que intentas guardar ya existe.",
                            new[] { "Nit" }));
                    }

                    if (DigitoVerificacion == null)
                    {
                        errores.Add(new ValidationResult("Para actualizar el NIT, se requiere el digito de verificación.",
                            new[] { "Nit" }));
                    }
                }
                #endregion

                #region DigitoVerificacion
                if (DigitoVerificacion != null)
                {
                    var digitoCalculado = CalcularDigitoVerificacion(Nit.ToString());
                    if (DigitoVerificacion.ToString() != digitoCalculado)
                    {
                        errores.Add(new ValidationResult("El digito verificación que intentas guardar no es correcto, debería ser " + digitoCalculado + ".",
                            new[] { "DigitoVerificacion" }));
                    }
                }
                #endregion
                #endregion

                #region RESIDENCIA
                #region DivisionPoliticaNivel2ResidenciaId
                if (DivisionPoliticaNivel2ResidenciaId != null)
                {
                    var DivisionPoliticaNivel2Residencia = contexto.DivisionPoliticaNiveles2.FirstOrDefault(x => x.Id == DivisionPoliticaNivel2ResidenciaId);
                    if (DivisionPoliticaNivel2Residencia == null)
                    {
                        errores.Add(new ValidationResult("El DivisionPoliticaNivel2 de residencia que intentas guardar no existe.",
                            new[] { "DivisionPoliticaNivel2ResidenciaId" }));
                    }
                }
                #endregion

                #region TipoViviendas
                if (TipoViviendaId != null)
                {
                    var tipoVivienda = contexto.TipoViviendas.FirstOrDefault(x => x.Id == TipoViviendaId);
                    if (tipoVivienda == null)
                    {
                        errores.Add(new ValidationResult("El tipo de vivienda que intentas guardar no existe.",
                            new[] { "TipoViviendaId" }));
                    }
                }
                #endregion

                #region TelefonoFijo
                if (TelefonoFijo != null)
                {
                    if (TelefonoFijo.Length < 6 || TelefonoFijo.Length > 15)
                    {
                        errores.Add(new ValidationResult("Rango permitido de 7 a 15 caracteres.", new[] { "TelefonoFijo" }));
                    }
                }
                #endregion

                //Direccion Pediente realizar validacion tipos DIAN
                #endregion

                #region LIBRETAMILITAR

                #region ClaseLibretaMilitarId
                if (ClaseLibretaMilitarId != null)
                {
                    var claseLibretaMilitarId = contexto.ClaseLibretaMilitares.FirstOrDefault(x => x.Id == ClaseLibretaMilitarId);
                    if (claseLibretaMilitarId == null)
                    {
                        errores.Add(new ValidationResult("La clase de libreta militar que intentas guardar no existe.",
                            new[] { "ClaseLibretaMilitarId" }));
                    }
                }
                #endregion

                #region NumeroLibreta
                if (NumeroLibreta != null)
                {
                    var numeroLibreta = contexto.Funcionarios.FirstOrDefault(x => x.Id != Id && x.NumeroLibreta == NumeroLibreta);
                    if (numeroLibreta != null)
                    {
                        errores.Add(new ValidationResult("El número de libreta militar que intentas guardar ya existe.",
                            new[] { "NumeroLibreta" }));
                    }
                }
                #endregion

                #region Distrito
                if (Distrito != null)
                    if (Distrito < 0 || Distrito > 999)
                    {

                        errores.Add(new ValidationResult(ConstantesErrores.Rango + "1 - 999.",
                            new[] { "Distrito" }));
                    }
                #endregion
                #endregion

                #region LICENCIACONDUCCION
                if (LicenciaConduccionAId != null)
                {
                    var licenciaConduccionAId = contexto.LicenciaConducciones.FirstOrDefault(x => x.Id == LicenciaConduccionAId);
                    if (licenciaConduccionAId == null)
                    {
                        errores.Add(new ValidationResult("La licencia de conducción que intentas guardar no existe.",
                            new[] { "LicenciaConduccionAId" }));
                    }
                    else
                    {
                        if (LicenciaConduccionAFechaVencimiento == null)
                        {
                            errores.Add(new ValidationResult("Se requiere la fecha de vencimiento para licencia de conducción categoría A.",
                                new[] { "LicenciaConduccionAFechaVencimiento" }));
                        }
                        else
                        {
                            if (LicenciaConduccionAFechaVencimiento != existe.LicenciaConduccionAFechaVencimiento && LicenciaConduccionAFechaVencimiento < fechaActual)
                            {
                                errores.Add(new ValidationResult("La fecha de vencimiento para la licencia de conducción categoría A no puede ser menor a la fecha actual.",
                                new[] { "LicenciaConduccionAFechaVencimiento" }));
                            }
                        }
                    }
                }
                if (LicenciaConduccionBId != null)
                {
                    var licenciaConduccionBId = contexto.LicenciaConducciones.FirstOrDefault(x => x.Id == LicenciaConduccionBId);
                    if (licenciaConduccionBId == null)
                    {
                        errores.Add(new ValidationResult("La licencia de conducción que intentas guardar no existe.",
                            new[] { "LicenciaConduccionBId" }));
                    }
                    else
                    {
                        if (LicenciaConduccionBFechaVencimiento == null)
                        {
                            errores.Add(new ValidationResult("Se requiere la fecha de vencimiento para licencia de conducción categoría B.",
                                new[] { "LicenciaConduccionBFechaVencimiento" }));
                        }
                        else
                        {
                            if (LicenciaConduccionBFechaVencimiento != existe.LicenciaConduccionBFechaVencimiento && LicenciaConduccionBFechaVencimiento < fechaActual)
                            {
                                errores.Add(new ValidationResult("La fecha de vencimiento para la licencia de conducción categoría B no puede ser menor a la fecha actual.",
                                new[] { "LicenciaConduccionBFechaVencimiento" }));
                            }
                        }
                    }
                }
                if (LicenciaConduccionCId != null)
                {
                    var licenciaConduccionCId = contexto.LicenciaConducciones.FirstOrDefault(x => x.Id == LicenciaConduccionCId);
                    if (licenciaConduccionCId == null)
                    {
                        errores.Add(new ValidationResult("La licencia de conducción que intentas guardar no existe.",
                            new[] { "LicenciaConduccionCId" }));
                    }
                    else
                    {
                        if (LicenciaConduccionCFechaVencimiento == null)
                        {
                            errores.Add(new ValidationResult("Se requiere la fecha de vencimiento para licencia de conducción categoría C.",
                                new[] { "LicenciaConduccionCFechaVencimiento" }));
                        }
                        else
                        {
                            if (LicenciaConduccionCFechaVencimiento != existe.LicenciaConduccionCFechaVencimiento && LicenciaConduccionCFechaVencimiento < fechaActual)
                            {
                                errores.Add(new ValidationResult("La fecha de vencimiento para la licencia de conducción categoría C no puede ser menor a la fecha actual.",
                                new[] { "LicenciaConduccionCFechaVencimiento" }));
                            }
                        }
                    }
                }
                #endregion

                #region OTROS
                #region NumeroCalzado
                if (NumeroCalzado != null)
                {
                    if (NumeroCalzado < 0 || NumeroCalzado > 99)
                    {
                        errores.Add(new ValidationResult(ConstantesErrores.Rango + "1 - 99.", new[] { "NumeroCalzado" }));
                    }
                }
                #endregion

                #region TipoSangres
                if (TipoSangreId != null)
                {
                    var tipoSangre = contexto.TipoSangres.FirstOrDefault(x => x.Id == TipoSangreId);
                    if (tipoSangre == null)
                    {
                        errores.Add(new ValidationResult("El tipo de sangre que intentas guardar no existe.",
                            new[] { "TipoSangreId" }));
                    }
                }
                #endregion

                #region CorreoElectronicoPersonal
                if (CorreoElectronicoPersonal != null)
                {
                    var correoElectronicoPersonal = contexto.Funcionarios
                        .FirstOrDefault(x => x.Id != Id && x.CorreoElectronicoPersonal == CorreoElectronicoPersonal);

                    if (correoElectronicoPersonal != null)
                    {
                        errores.Add(new ValidationResult("El correo electrónico personal que intentas guardar ya existe.",
                            new[] { "CorreoElectronicoPersonal" }));
                    }
                }
                #endregion
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
