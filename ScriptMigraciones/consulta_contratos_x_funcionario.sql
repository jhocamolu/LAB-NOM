SELECT *
FROM alcanos.alcanos.EMPLEADO



SELECT *
FROM alcanos.alcanos.



TELEFONO1

E_MAIL
U_EMAIL_ALTERNO


IDENTIFICACION
DIRECCION_HAB



UBICACIÓN

ESTADO_EMPLEADO
ESTADO_CIVIL
ACTIVO
CreateDate

FECHA_NACIMIENTO

FECHA_NACIMIENTO








IDENTIFICACION

IDENTIFICACION



RUBRO8
RUBRO6
RUBRO9
RUBRO7
SEXO



FECHA_NACIMIENTO
TIPO_SANGRE










SELECT
'' AS Adjunto, 
TELEFONO1 AS Celular,
'' AS ClaseLibretaMilitarId,
E_MAIL AS CorreoElectronicoCorporativo,
U_EMAIL_ALTERNO AS CorreoElectronicoPersonal,
'' AS CreadoPor,
'' AS CriterioBusqueda,
IDENTIFICACION AS DigitoVerificacion,
DIRECCION_HAB AS Direccion,
'' AS Distrito,
'' AS DivisionPoliticaNivel2ExpedicionDocumentoId,
'' AS DivisionPoliticaNivel2OrigenId,
UBICACION AS DivisionPoliticaNivel2ResidenciaId,
'' AS EliminadoPor,
ESTADO_EMPLEADO AS Estado,
ESTADO_CIVIL AS EstadoCivilId,
ACTIVO AS EstadoRegistro,
CreateDate AS FechaCreacion,
'' AS FechaEliminacion,
FECHA_NACIMIENTO AS FechaExpedicionDocumento,
'' AS FechaModificacion,
FECHA_NACIMIENTO AS FechaNacimiento,
'' AS Id,
'' AS LicenciaConduccionAFechaVencimiento,
'' AS LicenciaConduccionAId,
'' AS LicenciaConduccionBFechaVencimiento,
'' AS LicenciaConduccionBId,
'' AS LicenciaConduccionCFechaVencimiento,
'' AS LicenciaConduccionCId,
'' AS ModificadoPor,
IDENTIFICACION AS Nit,
'' AS NumeroCalzado,
IDENTIFICACION AS NumeroDocumento,
'' AS NumeroLibreta,
'' AS OcupacionId,
'' AS Pensionado,
RUBRO8 AS PrimerApellido,
RUBRO6 AS PrimerNombre,
RUBRO9 AS SegundoApellido,
RUBRO7 AS SegundoNombre,
SEXO AS SexoId,
'' AS TallaCamisa,
'' AS TallaPantalon,
'' AS TelefonoFijo,
FECHA_NACIMIENTO AS TipoDocumentoId,
TIPO_SANGRE AS TipoSangreId,
'' AS TipoViviendaId,
'' AS UsaLentes
FROM alcanos.alcanos.EMPLEADO


SELECT DATEDIFF(YEAR,emp.FECHA_NACIMIENTO,GETDATE()), 
	(CASE
		WHEN DATEADD(YY,DATEDIFF(YEAR,emp.FECHA_NACIMIENTO,GETDATE()),emp.FECHA_NACIMIENTO)>GETDATE() THEN 1
		ELSE 0 
	END) as Edad
	FROM alcanos.alcanos.EMPLEADO emp
	WHERE emp.IDENTIFICACION = '14138394'
	
	
Select floor((cast(convert(varchar(8),getdate(),112) as int)-cast(convert(varchar(8),emp.FECHA_NACIMIENTO,112) as int) ) / 10000) as edad 
from alcanos.alcanos.EMPLEADO emp
WHERE emp.IDENTIFICACION = '14138394'



SELECT *
FROM alcanos.alcanos.EMPLEADO_CONTRATO




select * from alcanos.ALC_CENTRO_MUNICIPIO
where DIVISION_GEOGRAFICA1='73'
 and DIVISION_GEOGRAFICA2 = '001'

--7300101

select centro_costo,UBICACION,FORMA_PAGO,ENTIDAD_FINANCIERA,TIPO_CUENTA_ENTIDAD,CUENTA_ENTIDAD
from alcanos.alcanos.empleado
where empleado = '14138423'

SELECT SUBSTRING('7300101', 1, 5)


select * 
from alcanos.alcanos.ADMIN_COTIZANTE
where empleado = '14138423'

select * 
from alcanos.alcanos.COTIZANTE
where empleado = '14138423'

SELECT *
FROM alcanos.alcanos.DEPARTAMENTO


SELECT DISTINCT dep.DESCRIPCION dependencia, pue.PUESTO cargo_codigo, pue.DESCRIPCION cargo_nombre
FROM alcanos.alcanos.EMPLEADO emp INNER JOIN alcanos.alcanos.DEPARTAMENTO dep ON (emp.DEPARTAMENTO = dep.DEPARTAMENTO)
INNER JOIN alcanos.alcanos.PUESTO pue ON (emp.PUESTO = pue.PUESTO)
WHERE emp.IDENTIFICACION = '14138394'


SELECT emp.E_MAIL
FROM alcanos.alcanos.EMPLEADO emp 
WHERE emp.IDENTIFICACION = '14138394'

SELECT * from alcanos.ALC_CENTRO_MUNICIPIO
where DIVISION_GEOGRAFICA1='73'
 and DIVISION_GEOGRAFICA2 = '001'
 
 SELECT *
 FROM alcanos.alcanos.EMPLEADO_CONTRATO
 
SELECT 'Activo' EstadoRegistro, 'sistema' CreadoPor, eco.CreateDate FechaCreacion, '' FuncionarioId, 
(CASE eco.TIPO_CONTRATO WHEN '01' THEN 2 WHEN '02' THEN 7 WHEN '03' THEN 1 WHEN '04' THEN 3 WHEN '05' THEN 8 END) TipoContratoId,
(CASE eco.ESTADO_CONTRATO WHEN 'I' THEN 'Terminado' WHEN 'A' THEN 'Vigente' END) EstadoContrato,
emp.IDENTIFICACION NumeroContrato, emp.PUESTO, emp.DEPARTAMENTO, eco.FECHA_INICIO FechaInicio, eco.FECHA_FINALIZACION FechaFinalizacion,
emp.SALARIO_REFERENCIA Sueldo, emp.UBICACION, emp.CENTRO_COSTO, 
(CASE emp.Forma_pago WHEN 'E' THEN 3 WHEN 'C' THEN 2 WHEN 'T' THEN 1 END) FormaPagoId, 1 TipoMonedaId,
emp.ENTIDAD_FINANCIERA, emp.TIPO_CUENTA_ENTIDAD, emp.CUENTA_ENTIDAD NumeroCuenta, 0 RecibeDotacion, 1 JornadaLaboralId, 0 EmpleadoConfianza, 
0 ProcedimientoRetencio, coti.CENTRO_TRABAJO CentroTrabajoId, eco.NOTAS, 1 GrupoNominaId
FROM alcanos.alcanos.EMPLEADO emp INNER JOIN alcanos.alcanos.EMPLEADO_CONTRATO eco ON (emp.EMPLEADo = eco.EMPLEADO)
LEFT JOIN alcanos.alcanos.COTIZANTE coti ON (emp.EMPLEADO = coti.EMPLEADO)
WHERE emp.IDENTIFICACION = '14138394'
 
 
 