IF OBJECT_ID('dbo.USP_CargarVacaciones', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE dbo.USP_CargarVacaciones as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Laura Katherine Estrada Arango
-- Create date: 05/10/2020
-- Description: Permite cargar la información de la tabla util.TemporalLibroVacaciones a 
--				dbo.LibroVacaciones
--
-- Parameters:
--  @Fecha:					Fecha para la cual se hace el proceso
--  @UsuarioOperacion:	    Usuario que realiza la operación
--  @Estado:			    Estado resultado del proceso
--  @Resultado:				Descripción del resultado
-- ==========================================================================================

ALTER PROCEDURE [dbo].[USP_CargarVacaciones] @Fecha            DATE,
                                                 @UsuarioOperacion VARCHAR(255),
                                                 @Estado           VARCHAR(255) OUTPUT,
                                                 @Resultado        TEXT OUTPUT
AS
BEGIN

    --------------------------------------------------------------------------
    -- Instrucciones de configuración y manejo de errores
    --------------------------------------------------------------------------
    SET XACT_ABORT, NOCOUNT, ANSI_NULLS, QUOTED_IDENTIFIER ON;
    DECLARE @Parametros VARCHAR(MAX)= CONCAT('@Fecha=', CONVERT(VARCHAR, @Fecha), '&', '@UsuarioOperacion=', CONVERT(VARCHAR, @UsuarioOperacion), '&', '@Estado=', CONVERT(VARCHAR, @Estado), '&', '@Resultado=', CONVERT(VARCHAR, @Resultado));
    DECLARE @NombreObjeto VARCHAR(255)= OBJECT_NAME(@@PROCID);
    DECLARE @MensajeExcepcion VARCHAR(255);

    --------------------------------------------------------------------------
    -- Variables
    --------------------------------------------------------------------------
    DECLARE @AuditoriaActivo VARCHAR(255);
    DECLARE @ContratoId INT;
	DECLARE @InicioCausacion DATE;
	DECLARE @FinCausacion DATE;
	DECLARE @TipoPeriodo VARCHAR(255);
	DECLARE @DiasTrabajados INT;
	DECLARE @DiasCausados INT;
	DECLARE @DiasDisponibles INT;
    DECLARE @RegistrosAfectados INT;
	DECLARE @RegistrosNoAfectados INT;
    DECLARE @TareaProgramadaLogExitoso VARCHAR(255);
    DECLARE @TareaProgramadaLogFallido VARCHAR(255);
	DECLARE @ParametroFecha DATE;
	DECLARE @FuncionarioId INT;
	DECLARE @FechaInicioVacaciones DATE;
	DECLARE	@DiasDisfrutados INT;
	DECLARE	@FechaFinVacaciones DATE;
	DECLARE	@DiasDinero INT;
	DECLARE	@FechaPagoVacaciones DATE;
	DECLARE	@RemuneracionRecibida MONEY;
	DECLARE	@FechaRegresoVacaciones DATE;
	DECLARE @LibroVacacionesId INT;
	DECLARE @EstadoSolicitudTerminada VARCHAR(255);
	DECLARE @RegistrosSolicitudesAfectados INT;
    --------------------------------------------------------------------------
    -- Proceso
    --------------------------------------------------------------------------
    BEGIN TRY

        -- Se consultan los estados
        SELECT @AuditoriaActivo = ces.AUDITORIA_ACTIVO,
			@EstadoSolicitudTerminada = ces.SOLICITUDVACACIONES_TERMINADA,
			@TareaProgramadaLogExitoso = ces.TAREAPROGRAMADALOG_EXITOSO,
			@TareaProgramadaLogFallido = ces.TAREAPROGRAMADALOG_FALLIDO
        FROM util.VW_ConstanteEstado AS ces;

	   SET @RegistrosAfectados = 0;
	   SET @RegistrosNoAfectados = 0;
	   SET @RegistrosSolicitudesAfectados = 0;
	   SET @Estado = @TareaProgramadaLogExitoso;
	   SET @Resultado = '';
	   SET @ParametroFecha = CONVERT(DATE,'1900-01-01');

        -- Inicio de la transacción
        BEGIN TRAN CargarLibroVacaciones;

        -- Se consultan los contratos sin iniciar cuya fecha sea menor o igual a @Fecha para pasarlos a vigente
        DECLARE CUR_TemporalLibroVacaciones CURSOR LOCAL
			FOR SELECT fun.ContratoId,
			tlb.InicioCausacion,
			tlb.FinCausacion,
			tlb.TipoPeriodo,
			tlb.DiasTrabajados,
			tlb.DiasCausados,
			tlb.DiasDisponibles,
			fun.Id,
			tlb.FechaInicioVacaciones,
			tlb.DiasDisfrutados,
			tlb.FechaFinVacaciones,
			tlb.DiasDinero,
			tlb.FechaPagoVacaciones,
			tlb.RemuneracionRecibida,
			tlb.FechaRegresoVacaciones
			FROM util._TemporalLibroVacaciones tlb
			INNER JOIN VW_FuncionarioDatoActual fun ON CONVERT(VARCHAR(255), tlb.Cedula) = fun.NumeroDocumento

        OPEN CUR_TemporalLibroVacaciones;

        FETCH NEXT FROM CUR_TemporalLibroVacaciones INTO @ContratoId, 
			@InicioCausacion, 
			@FinCausacion, 
			@TipoPeriodo, 
			@DiasTrabajados, 
			@DiasCausados, 
			@DiasDisponibles, 
			@FuncionarioId,
			@FechaInicioVacaciones,
			@DiasDisfrutados,
			@FechaFinVacaciones,
			@DiasDinero,
			@FechaPagoVacaciones,
			@RemuneracionRecibida,
			@FechaRegresoVacaciones;

        WHILE @@FETCH_STATUS = 0

        BEGIN
		  IF @ContratoId IS NOT NULL AND
		  @InicioCausacion IS NOT NULL AND
		  @InicioCausacion <> @ParametroFecha AND
		  @FinCausacion IS NOT NULL AND
		  @FinCausacion <> @ParametroFecha AND
		  @TipoPeriodo IS NOT NULL AND 
		  @DiasTrabajados IS NOT NULL AND 
		  @DiasCausados IS NOT NULL AND 
		  @DiasDisponibles  IS NOT NULL 
		  BEGIN
			INSERT INTO [dbo].[LibroVacaciones]
           ([ContratoId]
           ,[InicioCausacion]
           ,[FinCausacion]
           ,[Tipo]
           ,[DiasTrabajados]
           ,[DiasCausados]
           ,[DiasDisponibles]
           ,[DiasDebe]
           ,[EstadoRegistro]
           ,[CreadoPor]
           ,[FechaCreacion]
           )
			VALUES
			(@ContratoId, 
			@InicioCausacion, 
			@FinCausacion, 
			@TipoPeriodo, 
			@DiasTrabajados, 
			@DiasCausados, 
			@DiasDisponibles,
            0,
			@AuditoriaActivo,
			'Sistema',
			GETDATE()
           );
		   SET @RegistrosAfectados = @RegistrosAfectados + 1;

		   SELECT @LibroVacacionesId = SCOPE_IDENTITY();

		   INSERT INTO [dbo].[SolicitudVacaciones]
           ([FuncionarioId]
           ,[LibroVacacionesId]
           ,[FechaInicioDisfrute]
           ,[DiasDisfrute]
           ,[FechaFinDisfrute]
           ,[DiasDinero]
           ,[Estado]
           ,[FechaPago]
           ,[Remuneracion]
           ,[FechaRegreso]
           ,[EstadoRegistro]
           ,[CreadoPor]
           ,[FechaCreacion])
			VALUES
           (@FuncionarioId,
            @LibroVacacionesId,
            @FechaInicioVacaciones,
            @DiasDisfrutados,
			@FechaFinVacaciones,
			@DiasDinero,
			@EstadoSolicitudTerminada,
            @FechaPagoVacaciones,
			@RemuneracionRecibida,
			@FechaRegresoVacaciones,
            @AuditoriaActivo,
			'Sistema',
			GETDATE()
           )
		   SET @RegistrosSolicitudesAfectados = @RegistrosSolicitudesAfectados + 1;
		  END
		  ELSE
		  BEGIN 
		   SET @RegistrosNoAfectados = @RegistrosNoAfectados + 1;
		  END
		  
            FETCH NEXT FROM CUR_TemporalLibroVacaciones INTO @ContratoId, 
			@InicioCausacion, 
			@FinCausacion, 
			@TipoPeriodo, 
			@DiasTrabajados, 
			@DiasCausados, 
			@DiasDisponibles, 
			@FuncionarioId,
			@FechaInicioVacaciones,
			@DiasDisfrutados,
			@FechaFinVacaciones,
			@DiasDinero,
			@FechaPagoVacaciones,
			@RemuneracionRecibida,
			@FechaRegresoVacaciones;
        END;

        CLOSE CUR_TemporalLibroVacaciones;

        DEALLOCATE CUR_TemporalLibroVacaciones;

	   SET @Resultado = 'Se afectaron ' + CONVERT(VARCHAR, @RegistrosAfectados) + ' registros del libro de vacaciones. No se afectaron '+ CONVERT(VARCHAR, @RegistrosNoAfectados) + ' por falta de información. Se afectaron'+ CONVERT(VARCHAR, @RegistrosSolicitudesAfectados) + ' de la solicitud de vacaciones.';

        -- Cierre de la transacción
        IF @@TRANCOUNT > 0
        BEGIN
            IF XACT_STATE() = 1
            BEGIN
                COMMIT TRAN CargarLibroVacaciones;
            END;
            ELSE
            BEGIN
                EXEC util.USP_GenerarExcepcion
                     50000,
                     'No se puede confirmar la transacción.Error desconocido.';
            END;
        END;
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
