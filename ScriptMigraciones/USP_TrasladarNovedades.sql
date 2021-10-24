IF OBJECT_ID('util.USP_TrasladarNovedades', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE util.USP_TrasladarNovedades as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Reynaldo Andrés Sabogal
-- Create date: 08/01/2021
-- Description: Funcion para trasladar las novedades fijas de Softland a GHestic
--
-- Parameters:
--  @FuncionarioId:					Login del funcionario que realiza el proceso
-- ==========================================================================================

ALTER PROCEDURE [util].[USP_TrasladarNovedades] 
(@UsuarioOperacion VARCHAR(255) = 'Sistema')

AS
BEGIN

    --------------------------------------------------------------------------
    -- Instrucciones de configuración y manejo de errores
    --------------------------------------------------------------------------
    SET XACT_ABORT, NOCOUNT, ANSI_NULLS, QUOTED_IDENTIFIER ON;
    DECLARE @Parametros VARCHAR(MAX)= CONCAT('@UsuarioOperacion=', CONVERT(VARCHAR, @UsuarioOperacion));
    DECLARE @NombreObjeto VARCHAR(255)= OBJECT_NAME(@@PROCID);
    DECLARE @MensajeExcepcion VARCHAR(255);

    --------------------------------------------------------------------------
    -- Variables
    --------------------------------------------------------------------------
    DECLARE @ConceptoSoftland VARCHAR(255);
	DECLARE @CategoriaNovedad INT;	
	DECLARE @Empleado VARCHAR(255);	
	DECLARE @NitTercero VARCHAR(255);
	DECLARE @Acumulado MONEY;
	DECLARE @FechaAplicacion DATE;
	DECLARE @Monto MONEY;
	DECLARE @Cantidad INT;		
	DECLARE @FuncionarioId INT;		
	DECLARE @ValeTercero INT;	
	DECLARE @Ubicacion VARCHAR(255);	
	DECLARE @Nit VARCHAR(255);
	DECLARE @TerceroId INT = NULL;
	DECLARE @Modulo VARCHAR(255);
	DECLARE @NovedadId INT;
	DECLARE @LibranzaId INT;
	

	--------------------------------------------------------------------------
    -- Proceso
    --------------------------------------------------------------------------
    BEGIN TRY	
		
		-- Cursor para consultar las equivalencias de novedades a trasladar
		DECLARE CUR_EquivalenteNovedad CURSOR LOCAL
		FOR SELECT Concepto,CategoriaId,Modulo FROM util.EquivalenteNovedad;			

		OPEN CUR_EquivalenteNovedad;

		FETCH NEXT FROM CUR_EquivalenteNovedad INTO @ConceptoSoftland,@CategoriaNovedad,@Modulo;

        WHILE @@FETCH_STATUS = 0

        BEGIN
			
			--Consultar EMPLEADO_CONCEPTO para la novedad consultada los funcionarios
			DECLARE CUR_NovedadSoftland CURSOR LOCAL
			FOR SELECT ec.EMPLEADO,c.NIT,ec.ACUMULADO,ec.FECHA_ULT_APLIC,ec.MONTO,ec.CANTIDAD
			FROM alcanos.alcanos.EMPLEADO_CONCEPTO ec 
			INNER JOIN alcanos.alcanos.CONCEPTO c ON c.CONCEPTO = ec.CONCEPTO 
			WHERE ec.CONCEPTO = @ConceptoSoftland
			AND ec.ACUMULADO <>0 AND ec.MONTO <>0;

			OPEN CUR_NovedadSoftland;

			FETCH NEXT FROM CUR_NovedadSoftland INTO @Empleado,@NitTercero,@Acumulado,@FechaAplicacion,@Monto,@Cantidad;

			WHILE @@FETCH_STATUS = 0

			BEGIN
				--- obtener id de funcionario con cédula
				SELECT @FuncionarioId = Id
				FROM Funcionario
				WHERE NumeroDocumento = @Empleado;

				--- validar si categoria requiere tercero
				SELECT @ValeTercero = RequiereTercero,
					   @Ubicacion = UbicacionTercero
				FROM CategoriaNovedad
				WHERE Id = @CategoriaNovedad;

				IF @ValeTercero = 1 
				BEGIN 
					SET @Nit = SUBSTRING(@NitTercero,1,LEN(@NitTercero)-1);

					IF @Ubicacion = 'EntidadFinanciera'
					BEGIN						
						SELECT @TerceroId = Id
						FROM dbo.EntidadFinanciera
						WHERE Nit = @NitTercero;
					END;
					IF @Ubicacion = 'OtrosTerceros'
					BEGIN						
						SELECT @TerceroId = Id
						FROM dbo.Tercero
						WHERE Nit = @Nit;
					END;
					IF @Ubicacion = 'Administradora'
					BEGIN						
						SELECT @TerceroId = Id
						FROM dbo.Administradora
						WHERE Nit = @Nit;
					END;
				END;

				--- INSERTAMOS LA NOVEDAD
				IF @Modulo = 'OtrasNovedades'
				BEGIN
					INSERT INTO dbo.Novedad (FuncionarioId, CategoriaNovedadId, FechaAplicacion, FechaFinalizacion, Unidad, Valor, Cantidad, TerceroId, Observacion, Estado, EstadoRegistro, CreadoPor, FechaCreacion) 
					VALUES(@FuncionarioId, @CategoriaNovedad,@FechaAplicacion, '2050-12-31', 'Unidad',@Monto,'1', @TerceroId, 'Cargue automático de novedad', 'Pendiente', 'Activo', 'Sistema', GETDATE());
					
					SET @NovedadId = SCOPE_IDENTITY();

					--- INSERTAMOS NOVEDAD SUBPERIODO
					IF @Cantidad <> 3
					BEGIN
						IF @Cantidad <> 1 OR @Cantidad <> 2
						BEGIN
							SET @Cantidad = 1;
						END;
						INSERT INTO dbo.NovedadSubperiodo (NovedadId, SubperiodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@NovedadId, @Cantidad, 'Activo', 'Sistema', GETDATE());
					END;
					ELSE
					BEGIN
						INSERT INTO dbo.NovedadSubperiodo (NovedadId, SubperiodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@NovedadId, '1', 'Activo', 'Sistema', GETDATE());
						INSERT INTO dbo.NovedadSubperiodo (NovedadId, SubperiodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@NovedadId, '2', 'Activo', 'Sistema', GETDATE());
					END;
				END;

				IF @Modulo = 'Libranzas'
				BEGIN					
					INSERT INTO dbo.Libranza (FuncionarioId, EntidadFinancieraId, FechaInicio, ValorPrestamo, Estado, NumeroCuotas, Observacion, ValorCuota, Justificacion, EstadoRegistro, CreadoPor, FechaCreacion) 
					VALUES(@FuncionarioId, @TerceroId, @FechaAplicacion, 0, 'Vigente', NULL, 'Cargue de libranza de forma automatica', @Monto, NULL, 'Activo    ', 'Sistema', GETDATE());
					
					SET @LibranzaId = SCOPE_IDENTITY();
					
					--- INSERTAMOS LIBRANZA SUBPERIODO
					IF @Cantidad <> 3
					BEGIN
						IF @Cantidad <> 1 OR @Cantidad <> 2
						BEGIN
							SET @Cantidad = 1;
						END;
						INSERT INTO dbo.LibranzaSubperiodo (LibranzaId, SubPeriodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@LibranzaId, @Cantidad, 'Activo    ', 'Sistema',GETDATE());
					END;
					ELSE
					BEGIN
						INSERT INTO dbo.LibranzaSubperiodo (LibranzaId, SubPeriodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@LibranzaId, '1', 'Activo    ', 'Sistema',GETDATE());
						INSERT INTO dbo.LibranzaSubperiodo (LibranzaId, SubPeriodoId, EstadoRegistro, CreadoPor, FechaCreacion) 
						VALUES(@LibranzaId, '2', 'Activo    ', 'Sistema',GETDATE());
					END;					
				END;

				PRINT CONCAT('@Empleado= ',@Empleado);
				
				FETCH NEXT FROM CUR_NovedadSoftland INTO @Empleado,@NitTercero,@Acumulado,@FechaAplicacion,@Monto,@Cantidad;
			END;

			CLOSE CUR_NovedadSoftland;
			DEALLOCATE CUR_NovedadSoftland;		

			PRINT CONCAT('@ConceptoSoftland= ',@ConceptoSoftland);
			
		
		FETCH NEXT FROM CUR_EquivalenteNovedad INTO @ConceptoSoftland,@CategoriaNovedad,@Modulo;
        END;

        CLOSE CUR_EquivalenteNovedad;
        DEALLOCATE CUR_EquivalenteNovedad;		

	END TRY
    BEGIN CATCH

        -- Rollback de la transacción
        IF XACT_STATE() <> 0
           AND @@TRANCOUNT > 0
        BEGIN
            ROLLBACK;
        END;

        -- Se almacena la información del error
        EXEC util.USP_Registrarerror
             @NombreObjeto,
             @Parametros;

        -- Se lanza la excepción
        EXEC util.USP_LanzarExcepcion;
    END CATCH;
		 
END;