IF OBJECT_ID('util.USP_CargarOtrosi', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE util.USP_CargarOtrosi as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Diego Fernando Villegas Flórez
-- Create date: 17/08/2020
-- Description: Permite cargar los otrosi de los funcionarios desde la tabla 
--			 desde Softland hacía GHestic
--
-- Parameters:
--  @UsuarioOperacion:		Login del usuario que realiza la operación
-- ==========================================================================================

ALTER PROCEDURE [util].[USP_CargarOtrosi] @UsuarioOperacion VARCHAR(255) = 'Sistema'
AS
BEGIN

    --------------------------------------------------------------------------
    -- Instrucciones de configuración y manejo de errores
    --------------------------------------------------------------------------
    SET XACT_ABORT, NOCOUNT, ANSI_NULLS, QUOTED_IDENTIFIER ON;
    DECLARE @Parametros VARCHAR(MAX)= CONCAT('@UsuarioOperacion=', CONVERT(VARCHAR, @UsuarioOperacion));
    DECLARE @NombreObjeto VARCHAR(256)= OBJECT_NAME(@@PROCID);

    --------------------------------------------------------------------------
    -- Variables
    --------------------------------------------------------------------------
    -- Variables para calculos y otras operaciones
    DECLARE @NumeroDocumento VARCHAR(255);
    DECLARE @Prorroga1 DATE;
    DECLARE @Prorroga2 DATE;
    DECLARE @Prorroga3 DATE;
    DECLARE @Prorroga4 DATE;
    DECLARE @Prorroga5 DATE;
    DECLARE @Prorroga6 DATE;
    DECLARE @FuncionarioId INT;
    DECLARE @ContratoId INT;

    DECLARE @TipoContratoId INT;
    DECLARE @FechaFinalizacionContrato DATE;
    DECLARE @FechaFinalizacion DATE;
    DECLARE @CargoDependenciaId INT;
    DECLARE @NumeroOtroSi INT;
    DECLARE @Sueldo MONEY;
    DECLARE @FechaAplicacion DATE;
    DECLARE @CentroOperativoId INT;
    DECLARE @DivisionPoliticaNivel2Id INT;
    DECLARE @Observaciones VARCHAR(255);
    DECLARE @Prorroga INT;
    DECLARE @NumeroProrroga INT;

    --------------------------------------------------------------------------
    -- Proceso
    --------------------------------------------------------------------------
    BEGIN TRY

        -- Inicio de la transacción
        BEGIN TRAN CargarOtroSi;

        SET @Observaciones = 'Cargado de forma automática';

        DECLARE cotrosi CURSOR LOCAL
        FOR SELECT oex.NumeroDocumento,
                   oex.Prorroga1,
                   oex.Prorroga2,
                   oex.Prorroga3,
                   oex.Prorroga4,
                   oex.Prorroga5,
                   oex.Prorroga6
            FROM util._OtrosiExcel AS oex;

        OPEN cotrosi;
        FETCH NEXT FROM cotrosi INTO @NumeroDocumento, @Prorroga1, @Prorroga2, @Prorroga3, @Prorroga4, @Prorroga5, @Prorroga6;

        WHILE @@FETCH_STATUS = 0
        BEGIN

            -- Se consulta el funcionario con el número de documento
            SELECT @FuncionarioId = fun.Id
            FROM dbo.Funcionario AS fun
            WHERE fun.NumeroDocumento = @NumeroDocumento;

            IF @FuncionarioId IS NULL
            BEGIN
                PRINT CONCAT('El funcionario con documento =', CONVERT(VARCHAR, @NumeroDocumento), ' no se encontró.');
            END;
            ELSE
            BEGIN
                -- Se consulta el último contrato asociado al funcionario
                SELECT TOP 1 @ContratoId = con.Id,
                             @TipoContratoId = con.TipoContratoId,
                             @CargoDependenciaId = con.CargoDependenciaId,
                             @Sueldo = con.Sueldo,
                             @CentroOperativoId = con.CentroOperativoId,
                             @DivisionPoliticaNivel2Id = con.DivisionPoliticaNivel2Id,
                             @FechaFinalizacionContrato = con.FechaFinalizacion
                FROM dbo.Contrato AS con
                WHERE con.FuncionarioId = @FuncionarioId
                ORDER BY con.FechaInicio DESC;

                IF @ContratoId IS NULL
                BEGIN
                    PRINT CONCAT('El funcionario con documento =', CONVERT(VARCHAR, @NumeroDocumento), ' no tiene contratos.');
                END;
                ELSE
                BEGIN

                    IF NOT EXISTS
                    (
                        SELECT *
                        FROM dbo.ContratoOtroSi AS cosi
                        WHERE cosi.ContratoId = @ContratoId
                    )
                    BEGIN

                        IF @Prorroga1 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 1;
                            SET @FechaFinalizacion = @Prorroga1;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @FechaFinalizacionContrato);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 1;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;

                        IF @Prorroga2 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 2;
                            SET @FechaFinalizacion = @Prorroga2;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @Prorroga1);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 2;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;

                        IF @Prorroga3 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 3;
                            SET @FechaFinalizacion = @Prorroga3;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @Prorroga2);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 3;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;

                        IF @Prorroga4 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 4;
                            SET @FechaFinalizacion = @Prorroga4;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @Prorroga3);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 4;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;

                        IF @Prorroga5 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 5;
                            SET @FechaFinalizacion = @Prorroga5;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @Prorroga4);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 5;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;

                        IF @Prorroga6 IS NOT NULL
                        BEGIN

                            SET @NumeroOtroSi = 6;
                            SET @FechaFinalizacion = @Prorroga6;
                            SET @FechaAplicacion = DATEADD(DAY, 1, @Prorroga5);
                            SET @Prorroga = 1;
                            SET @NumeroProrroga = 6;

                            INSERT INTO dbo.ContratoOtroSi
                            (ContratoId,
                             TipoContratoId,
                             FechaFinalizacion,
                             CargoDependenciaId,
                             NumeroOtroSi,
                             Sueldo,
                             FechaAplicacion,
                             CentroOperativoId,
                             DivisionPoliticaNivel2Id,
                             Observaciones,
                             Prorroga,
                             EstadoRegistro,
                             CreadoPor,
                             FechaCreacion,
                             NumeroProrroga
                            )
                            VALUES
                            (@ContratoId,
                             @TipoContratoId,
                             @FechaFinalizacion,
                             @CargoDependenciaId,
                             @NumeroOtroSi,
                             @Sueldo,
                             @FechaAplicacion,
                             @CentroOperativoId,
                             @DivisionPoliticaNivel2Id,
                             @Observaciones,
                             @Prorroga,
                             'Activo',
                             @UsuarioOperacion,
                             GETDATE(),
                             @NumeroProrroga
                            );

                        END;
                    END;

                END;

            END;

            FETCH NEXT FROM cotrosi INTO @NumeroDocumento, @Prorroga1, @Prorroga2, @Prorroga3, @Prorroga4, @Prorroga5, @Prorroga6;
        END;

        CLOSE cotrosi;
        DEALLOCATE cotrosi;

        -- Cierre de la transacción
        IF @@TRANCOUNT > 0
        BEGIN
            IF XACT_STATE() = 1
            BEGIN
                COMMIT TRAN TrasladarContratos;
            END;
            ELSE
            BEGIN
                EXEC util.USP_GenerarExcepcion
                     50000,
                     'No se puede confirmar la transacción.  Error desconocido.';
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

GO