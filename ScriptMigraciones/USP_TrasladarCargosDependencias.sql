IF OBJECT_ID('util.USP_TrasladarCargosDependencias', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE util.USP_TrasladarCargosDependencias as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Laura Katherine Estrada Arango
-- Create date: 04/12/2020
-- Description: Permite trasladar la información de Cargos y Dependencias
--			 desde Softland hac�a GHestic
--
-- Parameters:
--  @UsuarioOperacion:		Login del usuario que realiza la operaci�n
-- ==========================================================================================

ALTER PROCEDURE [util].[USP_TrasladarCargosDependencias] @UsuarioOperacion VARCHAR(255) = 'Sistema'
AS
    BEGIN

        --------------------------------------------------------------------------
        -- Instrucciones de configuraci�n y manejo de errores
        --------------------------------------------------------------------------
        SET XACT_ABORT, NOCOUNT, ANSI_NULLS, QUOTED_IDENTIFIER ON;
        DECLARE @Parametros VARCHAR(MAX)= CONCAT('@UsuarioOperacion=', CONVERT(VARCHAR, @UsuarioOperacion));
        DECLARE @NombreObjeto VARCHAR(256)= OBJECT_NAME(@@PROCID);

        --------------------------------------------------------------------------
        -- Variables
        --------------------------------------------------------------------------
        -- Variables para calculos y otras operaciones
        DECLARE @CodigoCargo VARCHAR(255);
        DECLARE @NombreCargo VARCHAR(255);
        DECLARE @ObjetivoCargo VARCHAR(255);
        DECLARE @NivelCargoId INT;
        DECLARE @EstadoRegistro VARCHAR(255);
        DECLARE @CreadoPor VARCHAR(255)= @UsuarioOperacion;
        DECLARE @FechaCreacion DATE= GETDATE();
        DECLARE @CostoSicom BIT;
        DECLARE @Clase VARCHAR(255);
        DECLARE @EntidadCargo VARCHAR(255)= 'Cargo';
        DECLARE @CargoId INT;
        DECLARE @DependenciaCargoId INT;

        -- Variable para el cursor de dependencias.
        DECLARE @CodigoDependencia VARCHAR(255);
        DECLARE @NombreDependencia VARCHAR(255);
        DECLARE @DependenciaId INT;
        DECLARE @EstadoRegistroDependencia VARCHAR(255);
        DECLARE @EntidadDependencia VARCHAR(255)= 'Dependencia';
        DECLARE @CargoReporta INT;
        DECLARE @CargoJefe INT;
        DECLARE @OtroCargoJefe INT;
        --------------------------------------------------------------------------
        -- Proceso
        --------------------------------------------------------------------------
        BEGIN TRY

            -- Inicio de la transacción
            BEGIN TRAN TrasladarCargosDependencias;

            ----------------------------------------------------------------------------------------
            -- Cursor cargar dependencias.
            -----------------------------------------------------------------------------------------
            -- Se consultan la tabla DEPARTAMENTO de Softland
            DECLARE cur_dependencia CURSOR LOCAL
            FOR SELECT dep.DEPARTAMENTO, 
                       dep.DESCRIPCION, 
                       (CASE dep.ACTIVO
                            WHEN 'N'
                            THEN 'Inactivo'
                            WHEN 'S'
                            THEN 'Activo'
                            ELSE 'Inactivo'
                        END) AS EstadoRegistro
                FROM alcanos.alcanos.DEPARTAMENTO AS dep;
            OPEN cur_dependencia;
            FETCH NEXT FROM cur_dependencia INTO @CodigoDependencia, @NombreDependencia, @EstadoRegistroDependencia;
            WHILE @@FETCH_STATUS = 0
                BEGIN
                    IF NOT EXISTS
                    (
                        SELECT d.Id
                        FROM dbo.Dependencia d
                        WHERE d.Codigo = @CodigoDependencia
                    )
                        BEGIN
                            INSERT INTO dbo.Dependencia
                            (Codigo, 
                             Nombre, 
                             EstadoRegistro, 
                             CreadoPor, 
                             FechaCreacion
                            )
                            VALUES
                            (@CodigoDependencia, 
                             @NombreDependencia, 
                             @EstadoRegistroDependencia, 
                             @CreadoPor, 
                             @FechaCreacion
                            );

                            -- Se obtiene el id de la dependencia que se acabo de ingresar
                            SELECT @DependenciaId = SCOPE_IDENTITY();
                            IF NOT EXISTS
                            (
                                SELECT e.Softland
                                FROM util._EquivalenciaSoftland e
                                WHERE e.Entidad = @EntidadDependencia
                                      AND e.Softland = @CodigoDependencia
                            )
                                BEGIN
                                    INSERT INTO util.[_EquivalenciaSoftland]
                                    (Entidad, 
                                     Softland, 
                                     Ghestic, 
                                     EstadoRegistro, 
                                     CreadoPor, 
                                     FechaCreacion
                                    )
                                    VALUES
                                    (@EntidadDependencia, 
                                     @CodigoDependencia, 
                                     @DependenciaId, 
                                     @EstadoRegistroDependencia, 
                                     @CreadoPor, 
                                     @FechaCreacion
                                    );
                            END;
                    END;
                    FETCH NEXT FROM cur_dependencia INTO @CodigoDependencia, @NombreDependencia, @EstadoRegistroDependencia;
                END;
            CLOSE cur_dependencia;
            DEALLOCATE cur_dependencia;

            ---------------------------------------------------
            -- Cursor cargar cargos
            --------------------------------------------------
            -- Se consultan la tabla  PUESTO de Softland
            DECLARE cur_cargo CURSOR LOCAL
            FOR SELECT pue.PUESTO, 
                       pue.DESCRIPCION, 
                       tca.ObjetivoCargo AS Objetivo, 
                       nc.Id AS NivelCargo, 
                       0 AS CostoSicom, 
                       tca.Clase, 
                       dep.Id AS DependenciaId, 
                       (CASE pue.ACTIVO
                            WHEN 'N'
                            THEN 'Inactivo'
                            WHEN 'S'
                            THEN 'Activo'
                            ELSE 'Inactivo'
                        END) AS EstadoRegistro
                FROM alcanos.alcanos.PUESTO AS pue
                     LEFT JOIN util.TemporalCargo tca ON pue.PUESTO = tca.Codigo
                     LEFT JOIN dbo.NivelCargo nc ON tca.NivelCargo = nc.Nombre
                     LEFT JOIN dbo.Dependencia dep ON tca.Dependencia = dep.Nombre;
            OPEN cur_cargo;
            FETCH NEXT FROM cur_cargo INTO @CodigoCargo, @NombreCargo, @ObjetivoCargo, @NivelCargoId, @CostoSicom, @Clase, @DependenciaCargoId, @EstadoRegistro;
            WHILE @@FETCH_STATUS = 0
                BEGIN

					IF @ObjetivoCargo IS NULL
						SET @ObjetivoCargo = ' ';
					IF	@NivelCargoId IS NULL
						SET @NivelCargoId = 1;
					IF	@Clase IS NULL	
						SET @Clase = 'CentroOperativo';
                    IF NOT EXISTS
                    (
                        SELECT c.Id
                        FROM dbo.Cargo c
                        WHERE c.Codigo = @CodigoCargo
                    )
                        BEGIN
                            INSERT INTO dbo.Cargo
                            (Codigo, 
                             Nombre, 
                             ObjetivoCargo, 
                             NivelCargoId, 
                             EstadoRegistro, 
                             CreadoPor, 
                             FechaCreacion, 
                             CostoSicom, 
                             Clase
                            )
                            VALUES
                            (@CodigoCargo, 
                             @NombreCargo, 
                             @ObjetivoCargo, 
                             @NivelCargoId, 
                             @EstadoRegistro, 
                             @CreadoPor, 
                             @FechaCreacion, 
                             @CostoSicom, 
                             @Clase
                            );

                            -- Se obtiene el id del Cargo que se acabo de ingresar
                            SELECT @CargoId = SCOPE_IDENTITY();
                            -- Se registra el CargoGrupo
                            INSERT INTO dbo.CargoGrupo
                            (CargoId, 
                             GrupoId, 
                             Defecto, 
                             EstadoRegistro, 
                             CreadoPor, 
                             FechaCreacion
                            )
                            VALUES
                            (@CargoId, 
                             1, 
                             1, 
                             @EstadoRegistro, 
                             @CreadoPor, 
                             @FechaCreacion
                            );

                            -- Se inserta en tabla _EquivalenciaSoftland
                            IF NOT EXISTS
                            (
                                SELECT e.Softland
                                FROM util._EquivalenciaSoftland e
                                WHERE e.Entidad = @EntidadCargo
                                      AND e.Softland = @CodigoCargo
                            )
                                BEGIN
                                    INSERT INTO util.[_EquivalenciaSoftland]
                                    (Entidad, 
                                     Softland, 
                                     Ghestic, 
                                     EstadoRegistro, 
                                     CreadoPor, 
                                     FechaCreacion
                                    )
                                    VALUES
                                    (@EntidadCargo, 
                                     @CodigoCargo, 
                                     @CargoId, 
                                     @EstadoRegistro, 
                                     @CreadoPor, 
                                     @FechaCreacion
                                    );
                            END;
                            --  Se inserta en tabla CardoDependencia
                            IF @DependenciaCargoId IS NOT NULL
                                BEGIN
                                    INSERT INTO dbo.CargoDependencia
                                    (CargoId, 
                                     DependenciaId, 
                                     EstadoRegistro, 
                                     CreadoPor, 
                                     FechaCreacion
                                    )
                                    VALUES
                                    (@CargoId, 
                                     @DependenciaCargoId, 
                                     @EstadoRegistro, 
                                     @CreadoPor, 
                                     @FechaCreacion
                                    );
                            END;
                    END;
                    FETCH NEXT FROM cur_cargo INTO @CodigoCargo, @NombreCargo, @ObjetivoCargo, @NivelCargoId, @CostoSicom, @Clase, @DependenciaCargoId, @EstadoRegistro;
                END;
            CLOSE cur_cargo;
            DEALLOCATE cur_cargo;

            ----------------------------------------------------------------------------------------
            -- Cursor cargar CargoReporta.
            -----------------------------------------------------------------------------------------

            DECLARE cur_cargoReporta CURSOR LOCAL
            FOR SELECT cd.Id AS CargoReporta, 
                       cdj.Id AS CargoJefe, 
                       ocdj.Id AS OtroCargoJefe
                FROM util.TemporalCargo tc
                     INNER JOIN Cargo c ON tc.Codigo = c.Codigo
                     INNER JOIN CargoDependencia cd ON c.Id = cd.CargoId
                     INNER JOIN Cargo cj ON tc.CargoJefeInmediato = cj.Nombre
                     INNER JOIN CargoDependencia cdj ON cj.Id = cdj.CargoId
                     LEFT JOIN Cargo ocj ON tc.OtroCargoReporta = ocj.Nombre
                     LEFT JOIN CargoDependencia ocdj ON ocj.Id = ocdj.CargoId;
            OPEN cur_cargoReporta;
            FETCH NEXT FROM cur_cargoReporta INTO @CargoReporta, @CargoJefe, @OtroCargoJefe;
            WHILE @@FETCH_STATUS = 0
                BEGIN
                    IF NOT EXISTS
                    (
                        SELECT d.Id
                        FROM dbo.CargoReporta d
                        WHERE d.CargoDependenciaId = @CargoReporta
                              AND d.CargoDependenciaReportaId = @CargoJefe
                    )
                        BEGIN
                            INSERT INTO dbo.CargoReporta
                            (EstadoRegistro, 
                             CreadoPor, 
                             FechaCreacion, 
                             JefeInmediato, 
                             CargoDependenciaId, 
                             CargoDependenciaReportaId
                            )
                            VALUES
                            (@EstadoRegistro, 
                             @CreadoPor, 
                             @FechaCreacion, 
                             1, 
                             @CargoReporta, 
                             @CargoJefe
                            );
                    END;
                    IF @OtroCargoJefe IS NOT NULL
                        BEGIN
                            IF NOT EXISTS
                            (
                                SELECT d.Id
                                FROM dbo.CargoReporta d
                                WHERE d.CargoDependenciaId = @CargoReporta
                                      AND d.CargoDependenciaReportaId = @OtroCargoJefe
                            )
                                BEGIN
                                    INSERT INTO dbo.CargoReporta
                                    (EstadoRegistro, 
                                     CreadoPor, 
                                     FechaCreacion, 
                                     JefeInmediato, 
                                     CargoDependenciaId, 
                                     CargoDependenciaReportaId
                                    )
                                    VALUES
                                    (@EstadoRegistro, 
                                     @CreadoPor, 
                                     @FechaCreacion, 
                                     0, 
                                     @CargoReporta, 
                                     @OtroCargoJefe
                                    );
                            END;
                    END;
                    FETCH NEXT FROM cur_cargoReporta INTO @CargoReporta, @CargoJefe, @OtroCargoJefe;
                END;
            CLOSE cur_cargoReporta;
            DEALLOCATE cur_cargoReporta;

            -- Cierre de la transacción
            IF @@TRANCOUNT > 0
                BEGIN
                    IF XACT_STATE() = 1
                        BEGIN
                            COMMIT TRAN TrasladarCargosDependencias;
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