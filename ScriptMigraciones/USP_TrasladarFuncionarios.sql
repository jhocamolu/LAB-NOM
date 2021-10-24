IF OBJECT_ID('util.USP_TrasladarFuncionarios', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE util.USP_TrasladarFuncionarios as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Diego Fernando Villegas Fl�rez
-- Create date: 17/08/2020
-- Description: Permite trasladar los funcionarios desde Softland hac�a GHestic
--
-- Parameters:
--  @UsuarioOperacion:		    Login del usuario que realiza la operaci�n
-- ==========================================================================================

ALTER PROCEDURE [util].[USP_TrasladarFuncionarios] @UsuarioOperacion VARCHAR(255) = 'Sistema'
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
    DECLARE @PrimerNombre VARCHAR(255);
    DECLARE @SegundoNombre VARCHAR(255);
    DECLARE @PrimerApellido VARCHAR(255);
    DECLARE @SegundoApellido VARCHAR(255);
    DECLARE @SexoId INT;
    DECLARE @EstadoCivilId INT;
    DECLARE @OcupacionId INT;
    DECLARE @Pensionado INT;
    DECLARE @Estado CHAR(30);
    DECLARE @FechaNacimiento DATE;
    DECLARE @DivisionPoliticaNivel2OrigenId INT;
    DECLARE @TipoDocumentoId INT;
    DECLARE @NumeroDocumento VARCHAR(255);
    DECLARE @FechaExpedicionDocumento DATE;
    DECLARE @DivisionPoliticaNivel2ExpedicionDocumentoId INT;
    DECLARE @Nit VARCHAR(255);
    DECLARE @DigitoVerificacion INT;
    DECLARE @DivisionPoliticaNivel2ResidenciaId INT;
    DECLARE @Celular VARCHAR(255);
    DECLARE @TelefonoFijo VARCHAR(255);
    DECLARE @TipoViviendaId INT;
    DECLARE @Direccion VARCHAR(255);
    DECLARE @ClaseLibretaMilitarId INT;
    DECLARE @NumeroLibreta VARCHAR(255);
    DECLARE @Distrito INT;
    DECLARE @LicenciaConduccionAId INT;
    DECLARE @LicenciaConduccionAFechaVencimiento DATE;
    DECLARE @LicenciaConduccionBId INT;
    DECLARE @LicenciaConduccionBFechaVencimiento DATE;
    DECLARE @LicenciaConduccionCId INT;
    DECLARE @LicenciaConduccionCFechaVencimiento DATE;
    DECLARE @TallaCamisa VARCHAR(255);
    DECLARE @TallaPantalon VARCHAR(255);
    DECLARE @Calzado VARCHAR(255);
    DECLARE @NumeroCalzado FLOAT;
    DECLARE @UsaLentes BIT;
    DECLARE @TipoSangreId INT;
    DECLARE @CorreoElectronicoPersonal VARCHAR(255);
    DECLARE @CorreoElectronicoCorporativo VARCHAR(255);
    DECLARE @Adjunto VARCHAR(255);
    DECLARE @CriterioBusqueda NVARCHAR(255);
    DECLARE @EstadoRegistro CHAR(10);
    DECLARE @CreadoPor VARCHAR(255);
    DECLARE @FechaCreacion SMALLDATETIME;
    DECLARE @ModificadoPor VARCHAR(255);
    DECLARE @FechaModificacion SMALLDATETIME;
    DECLARE @EliminadoPor VARCHAR(255);
    DECLARE @FechaEliminacion SMALLDATETIME;

    -- Variables para calculos y otras operaciones
    DECLARE @Ubicacion VARCHAR(255);
    DECLARE @CentroOperativoId INT;
    DECLARE @CentroOperativo VARCHAR(255);
    DECLARE @Nombre VARCHAR(255);

    DECLARE @FuncionarioId INT;

    --------------------------------------------------------------------------
    -- Proceso
    --------------------------------------------------------------------------
    BEGIN TRY


        -- Inicio de la transacci�n
        BEGIN TRAN TrasladarFuncionarios;

	   /*
        -- Se valida que no existan funcionarios en la base de datos
        IF EXISTS
        (
            SELECT COUNT(*)
            FROM dbo.Funcionario
        )
        BEGIN
            EXEC util.USP_GenerarExcepcion
                 50000,
                 'Ya existen funcionarios en la base de datos';
        END;
	   */

        DECLARE cfuncionario CURSOR LOCAL
        FOR
            --Consulta la informaci�n de Softland--
            SELECT RUBRO6 AS PrimerNombre,
                         RUBRO7 AS SegundoNombre,
                         RUBRO8 AS PrimerApellido,
                         RUBRO9 AS SegundoApellido,
                         (CASE SEXO
                              WHEN 'F'
                              THEN 1
                              WHEN 'M'
                              THEN 2
                          ELSE 2
                          END) AS SexoId,
                         (CASE ESTADO_CIVIL
                              WHEN 'C'
                              THEN 1
                              WHEN 'D'
                              THEN 2
                              WHEN 'S'
                              THEN 3
                              WHEN 'U'
                              THEN 5
                              WHEN 'V'
                              THEN 6
                              WHEN 'O'
                              THEN 7
                          ELSE 7
                          END) AS EstadoCivilId,
                         493 AS OcupacionId,
                         0 AS Pensionado,
                         (CASE ESTADO_EMPLEADO
                              WHEN 'INAC'
                              THEN 'Retirado'
                              WHEN 'ACT'
                              THEN 'Activo'
                          ELSE 'Retirado'
                          END) AS Estado,
                         FECHA_NACIMIENTO AS FechaNacimiento,
                         NULL AS DivisionPoliticaNivel2OrigenId,
                         (CASE
                              WHEN FLOOR((CAST(CONVERT(VARCHAR(8), GETDATE(), 112) AS INT) - CAST(CONVERT(VARCHAR(8), FECHA_NACIMIENTO, 112) AS INT)) / 10000) > 18
                              THEN 3
                          ELSE 2
                          END) AS TipoDocumentoId,
                         IDENTIFICACION AS NumeroDocumento,
                         DATEADD(month, 1, (DATEADD(year, 18, FECHA_NACIMIENTO))) AS FechaExpedicionDocumento,
                         NULL AS DivisionPoliticaNivel2ExpedicionDocumentoId,
                         IDENTIFICACION AS Nit,
                         1 AS DigitoVerificacion,
                         NULL AS DivisionPoliticaNivel2ResidenciaId,
                         (CASE
                              WHEN LTRIM(RTRIM(TELEFONO1)) = ''
                                   OR TELEFONO1 IS NULL
                                   OR LEN(LTRIM(RTRIM(TELEFONO1))) < 10
                              THEN(CASE
                                       WHEN LTRIM(RTRIM(TELEFONO2)) = ''
                                            OR TELEFONO2 IS NULL
                                            OR LEN(LTRIM(RTRIM(TELEFONO2))) < 10
                                       THEN(CASE
                                                WHEN LEN(LTRIM(RTRIM(TELEFONO1))) > 0
                                                THEN TELEFONO1
                                            ELSE '0'
                                            END)
                                   ELSE LTRIM(RTRIM(TELEFONO2))
                                   END)
                          ELSE LTRIM(RTRIM(TELEFONO1))
                          END) AS Celular,
                         (CASE
                              WHEN LTRIM(RTRIM(TELEFONO1)) = ''
                                   OR TELEFONO1 IS NULL
                                   OR LEN(LTRIM(RTRIM(TELEFONO1))) > 9
                              THEN(CASE
                                       WHEN LTRIM(RTRIM(TELEFONO2)) = ''
                                            OR TELEFONO2 IS NULL
                                            OR LEN(LTRIM(RTRIM(TELEFONO2))) > 9
                                       THEN(CASE
                                                WHEN LEN(LTRIM(RTRIM(TELEFONO2))) > 0
                                                THEN TELEFONO2
                                            ELSE '0'
                                            END)
                                   ELSE LTRIM(RTRIM(TELEFONO2))
                                   END)
                          ELSE LTRIM(RTRIM(TELEFONO1))
                          END) AS TelefonoFijo,
                         3 AS TipoViviendaId,
                         (REPLACE(CAST(DIRECCION_HAB AS VARCHAR(1000)), 'DETALLE: ', '')) AS Direccion,
                         NULL AS ClaseLibretaMilitarId,
                         NULL AS NumeroLibreta,
                         NULL AS Distrito,
                         NULL AS LicenciaConduccionAId,
                         NULL AS LicenciaConduccionAFechaVencimiento,
                         NULL AS LicenciaConduccionBId,
                         NULL AS LicenciaConduccionBFechaVencimiento,
                         NULL AS LicenciaConduccionCId,
                         NULL AS LicenciaConduccionCFechaVencimiento,
                         RUBRO1 AS TallaCamisa,
                         RUBRO2 AS TallaPantalon,
                         RUBRO3 AS NumeroCalzado,
                         0 AS UsaLentes,
                         (CASE TIPO_SANGRE
                              WHEN 'O-'
                              THEN 6
                              WHEN 'A+'
                              THEN 1
                              WHEN 'A-'
                              THEN 2
                              WHEN 'B-'
                              THEN 8
                              WHEN 'O+'
                              THEN 5
                              WHEN 'AB-'
                              THEN 4
                              WHEN 'B+'
                              THEN 7
                              WHEN 'AB+'
                              THEN 3
                              WHEN 'ND'
                              THEN 5
                          ELSE 5
                          END) AS TipoSangreId,
                         U_EMAIL_ALTERNO AS CorreoElectronicoPersonal,
                         E_MAIL AS CorreoElectronicoCorporativo,
                         NULL AS Adjunto,
                         NULL AS CriterioBusqueda,
                         (CASE ACTIVO
                              WHEN 'N'
                              THEN 'Inactivo'
                              WHEN 'S'
                              THEN 'Activo'
                          ELSE 'Inactivo'
                          END) AS EstadoRegistro,
                         @UsuarioOperacion AS CreadoPor,
                         CreateDate AS FechaCreacion,
                         NULL AS ModificadoPor,
                         NULL AS FechaModificacion,
                         NULL AS EliminadoPor,
                         NULL AS FechaEliminacion,
					UBICACION AS Ubicacion,
					NOMBRE AS Nombre
            FROM alcanos.alcanos.EMPLEADO

        OPEN cfuncionario;

        --Navegar--
        FETCH NEXT FROM cfuncionario INTO @PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @SexoId, @EstadoCivilId, @OcupacionId, @Pensionado, @Estado, @FechaNacimiento, @DivisionPoliticaNivel2OrigenId, @TipoDocumentoId, @NumeroDocumento, @FechaExpedicionDocumento, @DivisionPoliticaNivel2ExpedicionDocumentoId, @Nit, @DigitoVerificacion, @DivisionPoliticaNivel2ResidenciaId, @Celular, @TelefonoFijo, @TipoViviendaId, @Direccion, @ClaseLibretaMilitarId, @NumeroLibreta, @Distrito, @LicenciaConduccionAId, @LicenciaConduccionAFechaVencimiento, @LicenciaConduccionBId, @LicenciaConduccionBFechaVencimiento, @LicenciaConduccionCId, @LicenciaConduccionCFechaVencimiento, @TallaCamisa, @TallaPantalon, @Calzado, @UsaLentes, @TipoSangreId, @CorreoElectronicoPersonal, @CorreoElectronicoCorporativo, @Adjunto, @CriterioBusqueda, @EstadoRegistro, @CreadoPor, @FechaCreacion, @ModificadoPor, @FechaModificacion, @EliminadoPor, @FechaEliminacion, @Ubicacion, @Nombre;
        WHILE @@fetch_status = 0

        BEGIN
				-- Se obtienen los datos de divisi�n pol�tica nivel 2
                SET @Ubicacion = SUBSTRING(@Ubicacion, 1, 5);

                -- Establecer ubicaci�n por defecto
                IF @Ubicacion IS NULL
                   OR @Ubicacion = 'ND'
                BEGIN
                    SET @Ubicacion = '41001';
                END;

                -- Si la ubicaci�n es este c�digo, se debe cambiar ya que dicho c�digo no corresponde a un c�digo de municipio
                IF @Ubicacion = '25512'
                BEGIN
                    SET @Ubicacion = '25572';
                END;

                -- Si la ubicaci�n es este c�digo, se debe cambiar ya que dicho c�digo no corresponde a un c�digo de municipio
                IF @Ubicacion = '17854'
                BEGIN
                    SET @Ubicacion = '73854';
                END;

                -- Obtener el c�digo del centro operativo en Sofland
                SELECT @CentroOperativo = CENTRO_OPERATIVO
                FROM alcanos.alcanos.ALC_CENTRO_MUNICIPIO
                WHERE DIVISION_GEOGRAFICA1 = SUBSTRING(@Ubicacion, 1, 2)
                      AND DIVISION_GEOGRAFICA2 = SUBSTRING(@Ubicacion, 3, 5);

			
				SELECT @DivisionPoliticaNivel2ExpedicionDocumentoId = dpn2.Id,
                       @DivisionPoliticaNivel2OrigenId = dpn2.Id,
                       @DivisionPoliticaNivel2ResidenciaId = dpn2.Id
                FROM DivisionPoliticaNivel2 AS dpn2
                WHERE dpn2.Codigo = @Ubicacion;

				-- Obtener el id del centro operativo en N�mina
                SELECT @CentroOperativoId = cop.Id
                FROM dbo.CentroOperativo AS cop
                WHERE cop.Codigo = @CentroOperativo;

            -- Si ya existe el funcionario en el sistema de n�mina, se pasa al siguiente funcionario
            IF NOT EXISTS
            (
                SELECT fun.Id
                FROM dbo.Funcionario AS fun
                WHERE fun.NumeroDocumento = @NumeroDocumento
            )
            BEGIN

                

                

                -- Si los rubros asociados a nombre y apellidos son nulos entonces se obtienen a partir del nombre completo
                IF @PrimerNombre IS NULL
                   OR @PrimerApellido IS NULL
                BEGIN
                    DECLARE @Empieza INT, @Termina INT, @ContadorNombres INT;
                    DECLARE @Delimitador VARCHAR(1);
                    SET @Empieza = 1;
                    SET @Delimitador = ' ';
                    SET @Termina = CHARINDEX(@Delimitador, @Nombre);
                    SET @ContadorNombres = 1;

                    SET @Nombre = REPLACE(@Nombre, '  ', ' ');

                    WHILE @Empieza < LEN(@Nombre) + 1
                    BEGIN
                        IF @Termina = 0
                        BEGIN
                            SET @Termina = LEN(@Nombre) + 1
                        END;

                        IF @ContadorNombres = 1
                        BEGIN
                            SET @PrimerApellido = SUBSTRING(@Nombre, @Empieza, @Termina - @Empieza)
                        END;

                        IF @ContadorNombres = 2
                        BEGIN
                            SET @SegundoApellido = SUBSTRING(@Nombre, @Empieza, @Termina - @Empieza)
                        END;

                        IF @ContadorNombres = 3
                        BEGIN
                            SET @PrimerNombre = SUBSTRING(@Nombre, @Empieza, @Termina - @Empieza)
                        END;

                        IF @ContadorNombres = 4
                        BEGIN
                            SET @SegundoNombre = SUBSTRING(@Nombre, @Empieza, @Termina - @Empieza)
                        END;

                        SET @Empieza = @Termina + 1;
                        SET @Termina = CHARINDEX(@Delimitador, @Nombre, @Empieza);

                        SET @ContadorNombres = @ContadorNombres + 1;

                    END;

                    -- Si la persona solo tiene un nombre y un apellido
                    IF @PrimerNombre IS NULL
                    BEGIN
                        SET @PrimerNombre = @SegundoApellido;
                        SET @SegundoApellido = NULL;
                    END;

                END;

			 -- Se trata de convertir el calzado a float
			 SET @NumeroCalzado = Try_convert(float,RTRIM(LTRIM(@Calzado)));


                -- Debug
                PRINT '---';
                PRINT 'Funcionario: ' + @NumeroDocumento;
                PRINT 'Ubicaci�n: ' + @Ubicacion;
                PRINT 'Nombre: ' + @Nombre;
                PRINT 'Primer nombre: ' + @PrimerNombre + ' Primer apellido: ' + @PrimerApellido;
			 
                INSERT INTO dbo.Funcionario
                (
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
                 CriterioBusqueda,
			  EstadoRegistro,
                 CreadoPor,
                 FechaCreacion
                )
                       SELECT @PrimerNombre,
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
                              @CriterioBusqueda,
						@EstadoRegistro,
                              @CreadoPor,
                              @FechaCreacion;

                -- Se obtiene el id del funcionario que se acabo de ingresar
                SELECT @FuncionarioId = SCOPE_IDENTITY();
			 

			 -- Se Registrar los contratos asociados al funcionario


            END;
			ELSE
			BEGIN
				SELECT 
				@FuncionarioId = fun.Id, 
				@NumeroDocumento = fun.NumeroDocumento
                FROM dbo.Funcionario AS fun
                WHERE fun.NumeroDocumento = @NumeroDocumento

			END
			-- Se Registrar los contratos asociados al funcionario
			 EXEC	[util].[USP_TrasladarContratos]
				@NumeroDocumento = @NumeroDocumento,
				@FuncionarioId = @FuncionarioId,
				@CentroOperativoId = @CentroOperativoId,
				@DivisionPoliticaNivel2ResidenciaId = @DivisionPoliticaNivel2ResidenciaId,
				@UsuarioOperacion = @UsuarioOperacion;
            FETCH NEXT FROM cfuncionario INTO @PrimerNombre, @SegundoNombre, @PrimerApellido, @SegundoApellido, @SexoId, @EstadoCivilId, @OcupacionId, @Pensionado, @Estado, @FechaNacimiento, @DivisionPoliticaNivel2OrigenId, @TipoDocumentoId, @NumeroDocumento, @FechaExpedicionDocumento, @DivisionPoliticaNivel2ExpedicionDocumentoId, @Nit, @DigitoVerificacion, @DivisionPoliticaNivel2ResidenciaId, @Celular, @TelefonoFijo, @TipoViviendaId, @Direccion, @ClaseLibretaMilitarId, @NumeroLibreta, @Distrito, @LicenciaConduccionAId, @LicenciaConduccionAFechaVencimiento, @LicenciaConduccionBId, @LicenciaConduccionBFechaVencimiento, @LicenciaConduccionCId, @LicenciaConduccionCFechaVencimiento, @TallaCamisa, @TallaPantalon, @Calzado, @UsaLentes, @TipoSangreId, @CorreoElectronicoPersonal, @CorreoElectronicoCorporativo, @Adjunto, @CriterioBusqueda, @EstadoRegistro, @CreadoPor, @FechaCreacion, @ModificadoPor, @FechaModificacion, @EliminadoPor, @FechaEliminacion, @Ubicacion, @Nombre;
        END;

        --Cerrar el cursor--
        CLOSE cfuncionario;
        DEALLOCATE cfuncionario;

	   -- Se cargan los otros� a los funcionarios
	   EXEC	[util].[USP_CargarOtrosi] @UsuarioOperacion = @UsuarioOperacion;


        -- Cierre de la transacci�n
        IF @@TRANCOUNT > 0
        BEGIN
            IF XACT_STATE() = 1
            BEGIN
                COMMIT TRAN TrasladarFuncionarios;
            END;
            ELSE
            BEGIN
                EXEC util.USP_GenerarExcepcion
                     50000,
                     'No se puede confirmar la transacci�n.  Error desconocido.';
            END;
        END;
    END TRY
    BEGIN CATCH

        -- Rollback de la transacci�n
        IF XACT_STATE() <> 0
           AND @@TRANCOUNT > 0
        BEGIN
            ROLLBACK;
        END;

        -- Se almacena la informaci�n del error
        EXEC util.USP_Registrarerror
             @NombreObjeto,
             @Parametros;

        -- Se lanza la excepci�n
        EXEC util.USP_LanzarExcepcion;
    END CATCH;
END;

