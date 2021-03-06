/****** Object:  StoredProcedure [dbo].[USP_TrasladarFuncionariosSoftland]    Script Date: 23/06/2020 4:28:02 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Creando el Procedimiento Almacenado--
ALTER PROCEDURE [dbo].[USP_TrasladarFuncionariosSoftland]
--ALTER PROCEDURE [dbo].[USP_TrasladarFuncionariosSoftland]
AS
BEGIN
	DECLARE @Adjunto varchar(255)
	DECLARE @Celular varchar(255)
	DECLARE @ClaseLibretaMilitarId int
	DECLARE @CorreoElectronicoCorporativo varchar(255)
	DECLARE @CorreoElectronicoPersonal varchar(255)
	DECLARE @CreadoPor varchar(255)
	DECLARE @CriterioBusqueda nvarchar(max)
	DECLARE @DigitoVerificacion int
	DECLARE @Direccion varchar(255)
	DECLARE @Distrito int
	DECLARE @Ubicacion varchar(255)
	DECLARE @DivisionPoliticaNivel2ExpedicionDocumentoId int
	DECLARE @DivisionPoliticaNivel2OrigenId int
	DECLARE @DivisionPoliticaNivel2ResidenciaId int
	DECLARE @CentroOperativo varchar(255)
	DECLARE @CentroOperativoId int
	DECLARE @EliminadoPor varchar(255)
	DECLARE @Estado varchar(255)
	DECLARE @EstadoCivilId int
	DECLARE @EstadoRegistro char(10)
	DECLARE @FechaCreacion smalldatetime
	DECLARE @FechaEliminacion smalldatetime
	DECLARE @FechaExpedicionDocumento date
	DECLARE @FechaModificacion smalldatetime
	DECLARE @FechaNacimiento date
	DECLARE @LicenciaConduccionAFechaVencimiento date
	DECLARE @LicenciaConduccionAId int
	DECLARE @LicenciaConduccionBFechaVencimiento date
	DECLARE @LicenciaConduccionBId int
	DECLARE @LicenciaConduccionCFechaVencimiento date
	DECLARE @LicenciaConduccionCId int
	DECLARE @ModificadoPor varchar(255)
	DECLARE @Nit varchar(255)
	DECLARE @NumeroCalzado float
	DECLARE @NumeroDocumento varchar(255)
	DECLARE @NumeroLibreta varchar(255)
	DECLARE @OcupacionId int
	DECLARE @Pensionado bit
	DECLARE @PrimerApellido varchar(255)
	DECLARE @PrimerNombre varchar(255)
	DECLARE @SegundoApellido varchar(255)
	DECLARE @SegundoNombre varchar(255)
	DECLARE @Nombre varchar(255)
	DECLARE @SexoId int
	DECLARE @TallaCamisa varchar(255)
	DECLARE @TallaPantalon varchar(255)
	DECLARE @TelefonoFijo varchar(255)
	DECLARE @TipoDocumentoId int
	DECLARE @TipoSangreId int
	DECLARE @TipoViviendaId int 
	DECLARE @UsaLentes bit


	DECLARE @FuncionarioId int;
	DECLARE @TipoContratoId int;
	DECLARE @EstadoContrato varchar(255);
	DECLARE @NumeroContrato varchar(255);
	DECLARE @Puesto varchar(255); 
	DECLARE @Departamento varchar(255); 
	DECLARE @DepartamentoNombre varchar(255); 
	DECLARE @CargoId int;
	DECLARE @DependenciaId int;
	DECLARE @CargoDependenciaId int; 
	DECLARE @PeriodoPrueba int; 
	DECLARE @FechaInicio date;
	DECLARE @FechaFinalizacion date;
	DECLARE @Sueldo money;
	DECLARE @CentroCosto varchar(255); 
	DECLARE @CentroCostoId int;
	DECLARE @FormaPagoId int;
	DECLARE @TipoMonedaId int;
	DECLARE @EntidadFinanciera varchar(255);
	DECLARE @EntidadFinancieraId int;
	DECLARE @TipoCuentaId int;
	DECLARE @NumeroCuenta varchar(255);
	DECLARE @RecibeDotacion bit;
	DECLARE @JornadaLaboralId int; 
	DECLARE @EmpleadoConfianza bit;
	DECLARE @ProcedimientoRetencio varchar(255);
	DECLARE @CentroTrabajoId int;
	DECLARE @Observaciones varchar(max);
	DECLARE @GrupoNominaId int;
	DECLARE @ContadorContratos smallint;
	DECLARE @DiasContrato int;
	DECLARE @TipoPeriodoId int;
	DECLARE @CargoGrupoId int;

	BEGIN TRY  
		BEGIN TRANSACTION

			--Creando el cursor--
			DECLARE cfuncionario CURSOR LOCAL FOR 
			--Consulta la información de Softland--
			SELECT TOP 5000
				NULL AS Adjunto, 
				(CASE WHEN RTRIM(TELEFONO1) = '' THEN '0' ELSE TELEFONO1 END) AS Celular,
				NULL AS ClaseLibretaMilitarId,
				E_MAIL AS CorreoElectronicoCorporativo,
				U_EMAIL_ALTERNO AS CorreoElectronicoPersonal,
				'sistema' AS CreadoPor,
				NULL AS CriterioBusqueda,
				1 AS DigitoVerificacion,
				DIRECCION_HAB AS Direccion,
				UBICACION,
				NULL AS Distrito,
				NULL AS DivisionPoliticaNivel2ExpedicionDocumentoId,
				NULL AS DivisionPoliticaNivel2OrigenId,
				NULL AS DivisionPoliticaNivel2ResidenciaId,
				NULL AS EliminadoPor,
				(CASE ESTADO_EMPLEADO WHEN 'INAC' THEN 'Retirado' WHEN 'ACT' THEN 'Seleccionado' ELSE 'Retirado' END) AS Estado,
				(CASE ESTADO_CIVIL WHEN 'U' THEN 5 WHEN 'C' THEN 1 WHEN 'D' THEN 2 WHEN 'O' THEN 7 WHEN 'V' THEN 6 WHEN 'S' THEN 3 ELSE 7 END) AS EstadoCivilId,
				(CASE ACTIVO WHEN 'N' THEN 'Inactivo' WHEN 'S' THEN 'Activo' ELSE 'Inactivo' END) AS EstadoRegistro,
				CreateDate AS FechaCreacion,
				NULL AS FechaEliminacion,
				DATEADD(year, 18, FECHA_NACIMIENTO) AS FechaExpedicionDocumento,
				NULL AS FechaModificacion,
				FECHA_NACIMIENTO AS FechaNacimiento,
				NULL AS LicenciaConduccionAFechaVencimiento,
				NULL AS LicenciaConduccionAId,
				NULL AS LicenciaConduccionBFechaVencimiento,
				NULL AS LicenciaConduccionBId,
				NULL AS LicenciaConduccionCFechaVencimiento,
				NULL AS LicenciaConduccionCId,
				NULL AS ModificadoPor,
				IDENTIFICACION AS Nit,
				RUBRO3 AS NumeroCalzado,
				IDENTIFICACION AS NumeroDocumento,
				NULL AS NumeroLibreta,
				493 AS OcupacionId,
				0 AS Pensionado,
				RUBRO8 AS PrimerApellido,
				RUBRO6 AS PrimerNombre,
				RUBRO9 AS SegundoApellido,
				RUBRO7 AS SegundoNombre,
				(CASE SEXO  WHEN 'F' THEN 1 WHEN 'M' THEN 2 ELSE 2 END) AS SexoId,
				RUBRO1 AS TallaCamisa,
				RUBRO2 AS TallaPantalon,
				(CASE WHEN RTRIM(TELEFONO2) = '' THEN '0' ELSE TELEFONO2 END) AS TelefonoFijo,
				(CASE WHEN floor((cast(convert(varchar(8),getdate(),112) as int)-cast(convert(varchar(8),FECHA_NACIMIENTO,112) as int) ) / 10000) > 18 THEN 3 ELSE 2 END) AS TipoDocumentoId,
				(CASE TIPO_SANGRE WHEN 'O-' THEN 6 WHEN 'A+' THEN 1 WHEN 'A-' THEN 2 WHEN 'B-' THEN 8 WHEN 'O+' THEN 5 WHEN 'AB-' THEN 4 WHEN 'B+' THEN 7 WHEN 'AB+' THEN 3 WHEN 'ND' THEN 5 ELSE 5 END) AS TipoSangreId,
				3 AS TipoViviendaId,
				0 AS UsaLentes,
				NOMBRE AS Nombre
				FROM alcanos.alcanos.EMPLEADO
				--where identificacion = '1085310747'

			--Abrir el cursor--
			OPEN cfuncionario

			--Navegar--
			FETCH NEXT FROM cfuncionario INTO @Adjunto, @Celular, @ClaseLibretaMilitarId, @CorreoElectronicoCorporativo, @CorreoElectronicoPersonal, @CreadoPor, @CriterioBusqueda,@DigitoVerificacion, @Direccion, @Ubicacion, @Distrito,@DivisionPoliticaNivel2ExpedicionDocumentoId,@DivisionPoliticaNivel2OrigenId, @DivisionPoliticaNivel2ResidenciaId, @EliminadoPor, @Estado, @EstadoCivilId,@EstadoRegistro,@FechaCreacion, @FechaEliminacion, @FechaExpedicionDocumento, @FechaModificacion,@FechaNacimiento, @LicenciaConduccionAFechaVencimiento, @LicenciaConduccionAId, @LicenciaConduccionBFechaVencimiento, @LicenciaConduccionBId, @LicenciaConduccionCFechaVencimiento, @LicenciaConduccionCId, @ModificadoPor, @Nit, @NumeroCalzado, @NumeroDocumento, @NumeroLibreta,@OcupacionId, @Pensionado, @PrimerApellido, @PrimerNombre, @SegundoApellido, @SegundoNombre, @SexoId, @TallaCamisa, @TallaPantalon, @TelefonoFijo,@TipoDocumentoId,@TipoSangreId,@TipoViviendaId,@UsaLentes,@Nombre
			WHILE @@fetch_status = 0
			
			BEGIN

				-- Si ya existe el funcionario en el sistema de nómina, se pasa al siguiente funcionario
				IF NOT EXISTS (
					SELECT fun.Id
					FROM dbo.Funcionario fun 
					WHERE fun.NumeroDocumento = @NumeroDocumento)
				BEGIN
					
				


					-- Se obtienen los datos de división política nivel 2
					SET @Ubicacion = SUBSTRING(@Ubicacion, 1, 5);

					-- Establecer ubicación por defecto
					IF @Ubicacion IS NULL OR @Ubicacion = 'ND'
					BEGIN
						SET @Ubicacion = '41001';
					END

					-- Si la ubicación es este código, se debe cambiar ya que dicho código no corresponde a un código de municipio
					IF @Ubicacion = '25512'
					BEGIN
						SET @Ubicacion = '25572'
					END

					-- Si la ubicación es este código, se debe cambiar ya que dicho código no corresponde a un código de municipio
					IF @Ubicacion = '17854'
					BEGIN
						SET @Ubicacion = '73854'
					END


					SELECT @DivisionPoliticaNivel2ExpedicionDocumentoId = dpn2.Id,
					@DivisionPoliticaNivel2OrigenId = dpn2.Id,
					@DivisionPoliticaNivel2ResidenciaId = dpn2.Id
					FROM DivisionPoliticaNivel2 dpn2
					WHERE dpn2.Codigo = @Ubicacion;

					




					-- Obtener el código del centro operativo en Sofland
					SELECT @CentroOperativo = CENTRO_OPERATIVO 
					FROM alcanos.alcanos.ALC_CENTRO_MUNICIPIO
					WHERE DIVISION_GEOGRAFICA1 = SUBSTRING(@Ubicacion, 1, 2) AND DIVISION_GEOGRAFICA2 = SUBSTRING(@Ubicacion, 3, 5);

					-- Obtener el id del centro operativo en Nómina
					SELECT @CentroOperativoId = cop.Id 
					FROM dbo.CentroOperativo cop 
					WHERE cop.Codigo = @CentroOperativo;

					-- Si los rubros asociados a nombre y apellidos son nulos entonces se obtienen a partir del nombre completo
					IF @PrimerNombre IS NULL OR @PrimerApellido IS NULL
					BEGIN
						DECLARE @Empieza INT, @Termina INT, @ContadorNombres INT
						DECLARE @Delimitador VARCHAR(1);
						SET @Empieza = 1
						SET @Delimitador = ' '
						SET @Termina= CHARINDEX(@Delimitador , @Nombre )
						SET @ContadorNombres = 1

						SET @Nombre = REPLACE(@Nombre, '  ', ' ');

						WHILE @Empieza < LEN(@Nombre ) + 1 
						BEGIN
							IF @Termina = 0  
								SET @Termina = LEN(@Nombre ) + 1
      
							IF @ContadorNombres = 1
								SET @PrimerApellido = SUBSTRING(@Nombre , @Empieza , @Termina - @Empieza )

							IF @ContadorNombres = 2
								SET @SegundoApellido = SUBSTRING(@Nombre , @Empieza , @Termina - @Empieza )

							IF @ContadorNombres = 3
								SET @PrimerNombre = SUBSTRING(@Nombre , @Empieza , @Termina - @Empieza )

							IF @ContadorNombres = 4
								SET @SegundoNombre = SUBSTRING(@Nombre , @Empieza , @Termina - @Empieza )
							
							SET @Empieza = @Termina + 1
							SET @Termina = CHARINDEX(@Delimitador , @Nombre , @Empieza )
        
							SET @ContadorNombres = @ContadorNombres + 1

						END

						-- Si la persona solo tiene un nombre y un apellido
						IF @PrimerNombre IS NULL
						BEGIN
							SET @PrimerNombre = @SegundoApellido
							SET @SegundoApellido = NULL
						END

					END


					-- Si el celular es nulo entonces se poner un valor por defecto
					IF @Celular IS NULL
					BEGIN
						SET @Celular = 'SD';
					END

					-- Debug
					print '---';
					print 'Funcionario: ' + @NumeroDocumento;
					print 'Ubicación: ' + @Ubicacion;
					print 'Nombre: ' + @Nombre;
					print 'Primer nombre: ' + @PrimerNombre + ' Primer apellido: ' + @PrimerApellido;
				
					SELECT @TipoPeriodoId=Id FROM dbo.TipoPeriodo WHERE PagoPorDefecto=1;
					
					print convert (Varchar, @TipoPeriodoId);

					INSERT INTO dbo.Funcionario (
					EstadoRegistro, 
					CreadoPor, 
					FechaCreacion, 
					PrimerNombre, 
					SegundoNombre, 
					PrimerApellido, 
					SegundoApellido, 
					SexoId, 
					EstadoCivilId, 
					OcupacionId, 
					Pensionado, 
					Estado, 
					FechaNacimiento, 
					DivisionPoliticaNivel2OrigenId, 
					TipoDocumentoId, 
					NumeroDocumento, 
					FechaExpedicionDocumento, 
					DivisionPoliticaNivel2ExpedicionDocumentoId, 
					Nit, 
					DigitoVerificacion, 
					DivisionPoliticaNivel2ResidenciaId, 
					Celular, 
					TelefonoFijo, 
					TipoViviendaId, 
					Direccion, 
					ClaseLibretaMilitarId, 
					NumeroLibreta, 
					Distrito, 
					LicenciaConduccionAId, 
					LicenciaConduccionAFechaVencimiento, 
					LicenciaConduccionBId, 
					LicenciaConduccionBFechaVencimiento, 
					LicenciaConduccionCId, 
					LicenciaConduccionCFechaVencimiento, 
					TallaCamisa, 
					TallaPantalon, 
					NumeroCalzado, 
					UsaLentes, 
					TipoSangreId, 
					CorreoElectronicoPersonal, 
					CorreoElectronicoCorporativo, 
					Adjunto, 
					CriterioBusqueda)
					SELECT 	
					@EstadoRegistro, 
					@CreadoPor, 
					@FechaCreacion, 
					@PrimerNombre, 
					@SegundoNombre, 
					@PrimerApellido, 
					@SegundoApellido, 
					@SexoId, 
					@EstadoCivilId, 
					@OcupacionId, 
					@Pensionado, 
					@Estado, 
					@FechaNacimiento, 
					@DivisionPoliticaNivel2OrigenId, 
					@TipoDocumentoId, 
					@NumeroDocumento, 
					@FechaExpedicionDocumento, 
					@DivisionPoliticaNivel2ExpedicionDocumentoId, 
					@Nit, 
					@DigitoVerificacion, 
					@DivisionPoliticaNivel2ResidenciaId, 
					@Celular, 
					@TelefonoFijo, 
					@TipoViviendaId, 
					@Direccion, 
					@ClaseLibretaMilitarId, 
					@NumeroLibreta, 
					@Distrito, 
					@LicenciaConduccionAId, 
					@LicenciaConduccionAFechaVencimiento, 
					@LicenciaConduccionBId, 
					@LicenciaConduccionBFechaVencimiento, 
					@LicenciaConduccionCId, 
					@LicenciaConduccionCFechaVencimiento, 
					@TallaCamisa, 
					@TallaPantalon, 
					@NumeroCalzado, 
					@UsaLentes, 
					@TipoSangreId, 
					@CorreoElectronicoPersonal, 
					@CorreoElectronicoCorporativo, 
					@Adjunto, 
					@CriterioBusqueda;

				
					-- Se obtiene el id del funcionario que se acabo de ingresar
					SELECT @FuncionarioId = SCOPE_IDENTITY();

					SET @ContadorContratos = 1;

					-- Se consultan los contratos del funcionario
					DECLARE ccontrato CURSOR LOCAL FOR 
						SELECT 'Activo' EstadoRegistro, 
						'sistema' CreadoPor, 
						eco.CreateDate FechaCreacion, 
						(CASE eco.TIPO_CONTRATO WHEN '01' THEN 2 WHEN '02' THEN 7 WHEN '03' THEN 1 WHEN '04' THEN 3 WHEN '05' THEN 8 END) TipoContratoId,
						(CASE eco.ESTADO_CONTRATO WHEN 'I' THEN 'Terminado' WHEN 'A' THEN 'Vigente' END) EstadoContrato,
						emp.PUESTO, 
						emp.DEPARTAMENTO, 
						eco.FECHA_INICIO FechaInicio, 
						eco.FECHA_FINALIZACION FechaFinalizacion,
						emp.SALARIO_REFERENCIA Sueldo, 
						emp.CENTRO_COSTO, 
						(CASE emp.Forma_pago WHEN 'E' THEN 3 WHEN 'C' THEN 2 WHEN 'T' THEN 1 END) FormaPagoId, 
						1 TipoMonedaId,
						(CASE emp.TIPO_CUENTA_ENTIDAD 
							WHEN '01' THEN 1 
							WHEN '02' THEN 2 
							WHEN '07' THEN 4 
							WHEN '09' THEN 5 
							WHEN '13' THEN 7 
							WHEN '19' THEN 11 
							WHEN '32' THEN 9 
							WHEN '51' THEN 10 
							WHEN '52' THEN 13 
							WHEN '57' THEN 9 
							WHEN '61' THEN 17 
							WHEN 'ND' THEN 27 
							ELSE 27 END) EntidadFinancieraId, 
						(CASE emp.TIPO_CUENTA_ENTIDAD WHEN 'CA' THEN 1 WHEN 'CC' THEN 2 ELSE 1 END) TipoCuentaId, 
						emp.CUENTA_ENTIDAD NumeroCuenta, 
						0 RecibeDotacion, 
						1 JornadaLaboralId, 
						0 EmpleadoConfianza, 
						0 ProcedimientoRetencio, 
						coti.CENTRO_TRABAJO CentroTrabajoId, 
						eco.NOTAS Observaciones, 
						1 GrupoNominaId
						FROM alcanos.alcanos.EMPLEADO emp INNER JOIN alcanos.alcanos.EMPLEADO_CONTRATO eco ON (emp.EMPLEADo = eco.EMPLEADO)
						LEFT JOIN alcanos.alcanos.COTIZANTE coti ON (emp.EMPLEADO = coti.EMPLEADO)
						WHERE emp.IDENTIFICACION = @NumeroDocumento


						OPEN ccontrato
						FETCH NEXT FROM ccontrato INTO @EstadoRegistro, @CreadoPor, @FechaCreacion, @TipoContratoId, @EstadoContrato,
						@Puesto, @Departamento, @FechaInicio, @FechaFinalizacion, @Sueldo, @CentroCosto, @FormaPagoId, @TipoMonedaId,
						@EntidadFinancieraId, @TipoCuentaId, @NumeroCuenta, @RecibeDotacion, @JornadaLaboralId, @EmpleadoConfianza,
						@ProcedimientoRetencio, @CentroTrabajoId, @Observaciones, @GrupoNominaId

						WHILE @@FETCH_STATUS = 0  
						BEGIN  

							  SET @NumeroContrato = @NumeroDocumento + '-' + (right(replicate('00',2)+cast(1 as varchar(15)),2));

							  -- Si el centro de trabajo es null, se asigna por defecto 1
							  IF @CentroTrabajoId IS NULL
							  BEGIN
								SET @CentroTrabajoId = 1
							  END

							  -- Con @Puesto, @Departamento se debe obtener el CargoDependenciaId

							  -- Se identifica el cargo
							  SELECT @CargoId = car.Id
							  FROM dbo.Cargo car 
							  WHERE car.Codigo = @Puesto;

							  -- Se identifca la dependencia
							  SELECT @DepartamentoNombre = dep.DESCRIPCION
							  FROM alcanos.alcanos.DEPARTAMENTO dep 
							  WHERE dep.DEPARTAMENTO = @Departamento;

							  SELECT TOP 1 @DependenciaId = dep.Id
							  FROM dbo.Dependencia dep
							  WHERE dep.Nombre LIKE @DepartamentoNombre;

								-- Se obtiene el cargo dependencia id

								IF @CargoId IS NOT NULL AND @DependenciaId IS NOT NULL
								BEGIN

								  --SET @CargoDependenciaId = 2; -- Temporalmente
								  SELECT @CargoDependenciaId = cde.Id
								  FROM dbo.CargoDependencia cde
								  WHERE cde.CargoId = @CargoId AND cde.DependenciaId = @DependenciaId
								  AND cde.EstadoRegistro = 'Activo';

								  
								SELECT @CargoGrupoId = cgr.Id  
								FROM CargoGrupo cgr 
								WHERE cgr.CargoId = @CargoId  AND cgr.Defecto  =  1 
								AND cgr.EstadoRegistro = 'Activo';

								   --SET @CargoGrupoId = 2; -- Temporalmente
								  SELECT @CargoGrupoId = cde.Id
								  FROM dbo.CargoGrupo cde
								  WHERE cde.CargoId = @CargoId AND cde.GrupoId = @DependenciaId
								  AND cde.EstadoRegistro = 'Activo';

								END
								ELSE
								BEGIN

									SET @CargoDependenciaId = 1;

								END;

							  -- Cálculo del periodo de prueba
							  SET @DiasContrato = DATEDIFF(day, @FechaInicio, @FechaFinalizacion);

							  SET @PeriodoPrueba = @DiasContrato / 5;

							  IF @PeriodoPrueba > 60 
							  BEGIN
								SET @PeriodoPrueba = 60;
							  END

							  IF @PeriodoPrueba < 0 
							  BEGIN
								SET @PeriodoPrueba = 0;
							  END

							  -- Obtener el identificador del centro de costo del funcionario
							  SELECT @CentroCostoId = cc.Id
							  FROM CentroCosto cc 
							  WHERE cc.Codigo = @CentroCosto;

							  -- Definir el estado del contrato
								IF cast(getDate() As Date) >= @FechaInicio AND  cast(getDate() As Date) <= @FechaFinalizacion
								BEGIN
									SET @Estado = 'Vigente';
								END
								ELSE
								BEGIN
									IF @FechaFinalizacion < cast(getDate() As Date)
									BEGIN
										SET @Estado = 'Finalizado';
									END
									ELSE
									BEGIN
										SET @Estado = 'Sin iniciar';
									END
								END;


							-- Si es centro de trabajo es 0, se le asigna un centro de trabajo por defecto
							IF @CentroTrabajoId IS NULL OR @CentroTrabajoId = 0
							BEGIN
								SET @CentroTrabajoId = 1
							END


							INSERT INTO [dbo].[Contrato]
										([EstadoRegistro]
										,[CreadoPor]
										,[FechaCreacion]
										,[FuncionarioId]
										,[TipoContratoId]
										,[NumeroContrato]
										,[CargoDependenciaId]
										,[PeriodoPrueba]
										,[FechaInicio]
										,[FechaFinalizacion]
										,[FechaTerminacion]
										,[Sueldo]
										,[CentroOperativoId]
										,[DivisionPoliticaNivel2Id]
										,[CentroCostoId]
										,[FormaPagoId]
										,[TipoMonedaId]
										,[EntidadFinancieraId]
										,[TipoCuentaId]
										,[NumeroCuenta]
										,[RecibeDotacion]
										,[JornadaLaboralId]
										,[EmpleadoConfianza]
										,[ProcedimientoRetencio]
										,[CentroTrabajoId]
										,[Observaciones]
										,[GrupoNominaId]
										,[Estado]
										,[TipoPeriodoId]
										,[CargoGrupoId])
									VALUES
										(@EstadoRegistro
										,@CreadoPor
										,@FechaCreacion
										,@FuncionarioId
										,@TipoContratoId
										,@NumeroContrato
										,@CargoDependenciaId
										,@PeriodoPrueba
										,@FechaInicio
										,@FechaFinalizacion
										,NULL
										,@Sueldo
										,@CentroOperativoId
										,@DivisionPoliticaNivel2ResidenciaId
										,@CentroCostoId
										,@FormaPagoId
										,@TipoMonedaId
										,@EntidadFinancieraId
										,@TipoCuentaId
										,@NumeroCuenta
										,@RecibeDotacion
										,@JornadaLaboralId
										,@EmpleadoConfianza
										,@ProcedimientoRetencio
										,@CentroTrabajoId
										,@Observaciones
										,@GrupoNominaId
										,@EstadoContrato
										,@TipoPeriodoId
										,@CargoGrupoId)

							  FETCH NEXT FROM ccontrato INTO @EstadoRegistro, @CreadoPor, @FechaCreacion, @TipoContratoId, @EstadoContrato,
								@Puesto, @Departamento, @FechaInicio, @FechaFinalizacion, @Sueldo, @CentroCosto, @FormaPagoId, @TipoMonedaId,
								@EntidadFinancieraId, @TipoCuentaId, @NumeroCuenta, @RecibeDotacion, @JornadaLaboralId, @EmpleadoConfianza,
								@ProcedimientoRetencio, @CentroTrabajoId, @Observaciones, @GrupoNominaId

								SET @ContadorContratos = @ContadorContratos + 1;

							
						END 

					CLOSE ccontrato  
					DEALLOCATE ccontrato 
				
				END

				FETCH NEXT FROM cfuncionario INTO @Adjunto, @Celular, @ClaseLibretaMilitarId, @CorreoElectronicoCorporativo, @CorreoElectronicoPersonal, @CreadoPor, @CriterioBusqueda,@DigitoVerificacion, @Direccion, @Ubicacion, @Distrito,@DivisionPoliticaNivel2ExpedicionDocumentoId,@DivisionPoliticaNivel2OrigenId, @DivisionPoliticaNivel2ResidenciaId, @EliminadoPor, @Estado, @EstadoCivilId,@EstadoRegistro,@FechaCreacion, @FechaEliminacion, @FechaExpedicionDocumento, @FechaModificacion,@FechaNacimiento, @LicenciaConduccionAFechaVencimiento, @LicenciaConduccionAId, @LicenciaConduccionBFechaVencimiento, @LicenciaConduccionBId, @LicenciaConduccionCFechaVencimiento, @LicenciaConduccionCId, @ModificadoPor, @Nit, @NumeroCalzado, @NumeroDocumento, @NumeroLibreta,@OcupacionId, @Pensionado, @PrimerApellido, @PrimerNombre, @SegundoApellido, @SegundoNombre, @SexoId, @TallaCamisa, @TallaPantalon, @TelefonoFijo,@TipoDocumentoId,@TipoSangreId,@TipoViviendaId,@UsaLentes,@Nombre
			END

			--Cerrar el cursor--
			CLOSE cfuncionario
			DEALLOCATE cfuncionario

		COMMIT TRANSACTION

	END TRY
	BEGIN CATCH
		ROLLBACK TRANSACTION;
		EXEC [util].[USP_RegistrarError];
	END CATCH  
END
