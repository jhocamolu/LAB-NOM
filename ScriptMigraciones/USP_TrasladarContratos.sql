IF OBJECT_ID('util.USP_TrasladarContratos', 'P') IS NULL
BEGIN
    EXECUTE ('CREATE PROCEDURE util.USP_TrasladarContratos as SELECT 1');
END;
GO
-- ==========================================================================================
-- Author:      Diego Fernando Villegas Fl�rez
-- Create date: 17/08/2020
-- Description: Permite trasladar la informaci�n contractual de los funcionarios
--			 desde Softland hac�a GHestic
--
-- Parameters:
--  @NumeroDocumento:		N�mero de documento del funcionario
--  @FuncionarioId:			Identificador del funcionario
--  @UsuarioOperacion:		Login del usuario que realiza la operaci�n
-- ==========================================================================================

ALTER PROCEDURE [util].[USP_TrasladarContratos] @NumeroDocumento                    VARCHAR(255), 
                                                @FuncionarioId                      INT, 
                                                @CentroOperativoId                  INT, 
                                                @DivisionPoliticaNivel2ResidenciaId INT, 
                                                @UsuarioOperacion                   VARCHAR(255) = 'Sistema'
AS
    BEGIN

        --------------------------------------------------------------------------
        -- Instrucciones de configuraci�n y manejo de errores
        --------------------------------------------------------------------------
        SET XACT_ABORT, NOCOUNT, ANSI_NULLS, QUOTED_IDENTIFIER ON;
        DECLARE @Parametros VARCHAR(MAX)= CONCAT('@NumeroDocumento=', CONVERT(VARCHAR, @NumeroDocumento), '@FuncionarioId=', CONVERT(VARCHAR, @FuncionarioId), '@UsuarioOperacion=', CONVERT(VARCHAR, @UsuarioOperacion));
        DECLARE @NombreObjeto VARCHAR(256)= OBJECT_NAME(@@PROCID);

        --------------------------------------------------------------------------
        -- Variables
        --------------------------------------------------------------------------
        -- Variables para calculos y otras operaciones
        DECLARE @TipoContratoId INT;
        DECLARE @EstadoContrato VARCHAR(255);
        DECLARE @NumeroContrato VARCHAR(255);
        DECLARE @Puesto VARCHAR(255);
        DECLARE @Departamento VARCHAR(255);
        DECLARE @DepartamentoNombre VARCHAR(255);
        DECLARE @CargoId INT= NULL;
        DECLARE @DependenciaId INT= NULL;
        DECLARE @CargoDependenciaId INT= NULL;
        DECLARE @PeriodoPrueba INT;
        DECLARE @FechaInicio DATE;
        DECLARE @FechaFinalizacion DATE;
        DECLARE @Sueldo MONEY;
        DECLARE @CentroCosto VARCHAR(255);
        DECLARE @CentroCostoId INT;
        DECLARE @FormaPagoId INT;
        DECLARE @TipoMonedaId INT;
        DECLARE @EntidadFinanciera VARCHAR(255);
        DECLARE @EntidadFinancieraId INT;
        DECLARE @TipoCuentaId INT;
        DECLARE @NumeroCuenta VARCHAR(255);
        DECLARE @RecibeDotacion BIT;
        DECLARE @JornadaLaboralId INT;
        DECLARE @EmpleadoConfianza BIT;
        DECLARE @ProcedimientoRetencio VARCHAR(255);
        DECLARE @CentroTrabajoId INT;
        DECLARE @Observaciones VARCHAR(MAX);
        DECLARE @GrupoNomina VARCHAR(255)= '';
        DECLARE @GrupoNominaId INT;
        DECLARE @ContadorContratos SMALLINT;
        DECLARE @DiasContrato INT;
        DECLARE @TipoPeriodoId INT;
        DECLARE @CargoGrupoId INT;
        DECLARE @FechaCreacion SMALLDATETIME;
        DECLARE @FechaTerminacion DATE;
        DECLARE @TipoCotizante VARCHAR(255);
        DECLARE @SubTipoCotizante VARCHAR(255);
        DECLARE @TipoCotizanteId INT;
        DECLARE @SubTipoCotizanteId INT;
        DECLARE @TipoCotizanteSubtipoCotizanteId INT;
        DECLARE @ContratoId INT;
        DECLARE @Administradora VARCHAR(255);
        DECLARE @AdministradoraId INT;
        DECLARE @AdministradoraFechaInicio DATE;
        DECLARE @AdministradoraFechaFin DATE;

        --------------------------------------------------------------------------
        -- Proceso
        --------------------------------------------------------------------------
        BEGIN TRY

            -- Inicio de la transacci�n
            BEGIN TRAN TrasladarContratos;

            -- Se consultan los datos adicionales del funcionario en Softland para crear el contrato
/***************************************************
SELECT *
        FROM alcanos.alcanos.Empleado AS emp
        WHERE emp.Identificacion = @NumeroDocumento;
***************************************************/

            SELECT @TipoPeriodoId = Id
            FROM dbo.TipoPeriodo
            WHERE PagoPorDefecto = 1;
            PRINT CONCAT('@TipoPeriodoId=', CONVERT(VARCHAR, @TipoPeriodoId));
            PRINT CONCAT('@NumeroDocumento=', CONVERT(VARCHAR, @NumeroDocumento));
            SET @ContadorContratos = 1;

            -- Se consultan los contratos del funcionario
            DECLARE ccontrato CURSOR LOCAL
            FOR SELECT(CASE eco.TIPO_CONTRATO
                           WHEN '01'
                           THEN 2
                           WHEN '02'
                           THEN 7
                           WHEN '03'
                           THEN 1
                           WHEN '04'
                           THEN 3
                           WHEN '05'
                           THEN 8
                       END) AS TipoContratoId, 
                      (CASE eco.ESTADO_CONTRATO
                           WHEN 'N'
                           THEN 'Terminado'
                           WHEN 'I'
                           THEN 'Terminado'
                           WHEN 'A'
                           THEN 'Vigente'
                       END) AS EstadoContrato, 
                      emp.PUESTO, 
                      emp.DEPARTAMENTO, 
                      eco.FECHA_INICIO AS FechaInicio, 
                      eco.FECHA_FINALIZACION AS FechaFinalizacion, 
                      emp.SALARIO_REFERENCIA AS Sueldo, 
                      emp.CENTRO_COSTO, 
                      (CASE emp.Forma_pago
                           WHEN 'E'
                           THEN 3
                           WHEN 'C'
                           THEN 2
                           WHEN 'T'
                           THEN 1
                       END) AS FormaPagoId, 
                      1 AS TipoMonedaId, 
                      (CASE emp.TIPO_CUENTA_ENTIDAD
                           WHEN '01'
                           THEN 1
                           WHEN '02'
                           THEN 2
                           WHEN '07'
                           THEN 4
                           WHEN '09'
                           THEN 5
                           WHEN '13'
                           THEN 7
                           WHEN '19'
                           THEN 11
                           WHEN '32'
                           THEN 9
                           WHEN '51'
                           THEN 10
                           WHEN '52'
                           THEN 13
                           WHEN '57'
                           THEN 9
                           WHEN '61'
                           THEN 17
                           WHEN 'ND'
                           THEN 27
                           ELSE 27
                       END) AS EntidadFinancieraId, 
                      (CASE emp.TIPO_CUENTA_ENTIDAD
                           WHEN 'CA'
                           THEN 1
                           WHEN 'CC'
                           THEN 2
                           ELSE 1
                       END) AS TipoCuentaId, 
                      emp.CUENTA_ENTIDAD AS NumeroCuenta, 
                      0 AS RecibeDotacion, 
                      1 AS JornadaLaboralId, 
                      0 AS EmpleadoConfianza, 
                      'Procedimiento1' AS ProcedimientoRetencio, 
                      coti.CENTRO_TRABAJO AS CentroTrabajoId, 
                      eco.NOTAS AS Observaciones, 
                      emp.NOMINA AS GrupoNominaId, 
                      eco.CreateDate AS FechaCreacion
                FROM alcanos.alcanos.EMPLEADO AS emp
                     INNER JOIN alcanos.alcanos.EMPLEADO_CONTRATO AS eco ON(emp.EMPLEADo = eco.EMPLEADO)
                     LEFT JOIN alcanos.alcanos.COTIZANTE AS coti ON(emp.EMPLEADO = coti.EMPLEADO)
                WHERE emp.IDENTIFICACION = @NumeroDocumento
                ORDER BY eco.FECHA_FINALIZACION ASC;
            OPEN ccontrato;
            FETCH NEXT FROM ccontrato INTO @TipoContratoId, @EstadoContrato, @Puesto, @Departamento, @FechaInicio, @FechaFinalizacion, @Sueldo, @CentroCosto, @FormaPagoId, @TipoMonedaId, @EntidadFinancieraId, @TipoCuentaId, @NumeroCuenta, @RecibeDotacion, @JornadaLaboralId, @EmpleadoConfianza, @ProcedimientoRetencio, @CentroTrabajoId, @Observaciones, @GrupoNomina, @FechaCreacion;
            WHILE @@FETCH_STATUS = 0
                BEGIN
                    IF NOT EXISTS
                    (
                        SELECT con.Id
                        FROM dbo.Contrato AS con
                        WHERE con.FuncionarioId = @FuncionarioId
                              AND con.FechaInicio = @FechaInicio
                              AND con.FechaFinalizacion = @FechaFinalizacion
                    )
                        BEGIN
                            SET @NumeroContrato = @NumeroDocumento + '-' + (RIGHT(REPLICATE('00', 2) + CAST(1 AS VARCHAR(15)), 2));

                            -- Se obtiene el grupo nómina a partir del código
                            SELECT @GrupoNominaId = gn.Id
                            FROM dbo.GrupoNomina gn
                            WHERE gn.Nombre = @GrupoNomina;

							-- Si el grupo nomina id no se encuentra, se toma por defecto QUIN
							IF @GrupoNominaId IS NULL
							BEGIN
								SELECT @GrupoNominaId = gn.Id
								FROM dbo.GrupoNomina gn
								WHERE gn.Nombre = 'QUIN';
							END

                            -- Se obtiene la dependencia equivalente
                            SELECT @DependenciaId = eso.Ghestic
                            FROM util._EquivalenciaSoftland AS eso
                            WHERE eso.Entidad = 'Dependencia'
                                  AND eso.softland = @Departamento
                                  AND eso.EstadoRegistro = 'Activo';
                            IF @Puesto = 'JEFEREL'
                                SET @Puesto = 'DIRDEGHU';

                            -- Se obtiene el cargo equivalente
                            SELECT @CargoId = eso.Ghestic
                            FROM util._EquivalenciaSoftland AS eso
                            WHERE eso.Entidad = 'Cargo'
                                  AND eso.softland = @Puesto
                                  AND eso.EstadoRegistro = 'Activo';

                            --SET @CargoDependenciaId = 2; -- Temporalmente
                            SELECT @CargoDependenciaId = cde.Id
                            FROM dbo.CargoDependencia AS cde
                            WHERE cde.CargoId = @CargoId
                                  AND cde.DependenciaId = @DependenciaId
                                  AND cde.EstadoRegistro = 'Activo';
                            SELECT @CargoGrupoId = cgr.Id
                            FROM CargoGrupo AS cgr
                            WHERE cgr.CargoId = @CargoId
                                  AND cgr.Defecto = 1
                                  AND cgr.EstadoRegistro = 'Activo';
                            PRINT CONCAT('@CargoId=', CONVERT(VARCHAR, @CargoId));
                            PRINT CONCAT('@Puesto=', CONVERT(VARCHAR, @Puesto));
                            PRINT CONCAT('@DependenciaId=', CONVERT(VARCHAR, @DependenciaId));
                            PRINT CONCAT('@Departamento=', CONVERT(VARCHAR, @Departamento));

                            --SET @CargoDependenciaId = 2; -- Temporalmente
                            IF @CargoId IS NOT NULL
                               AND @DependenciaId IS NOT NULL
                                BEGIN
                                    SELECT @CargoDependenciaId = cde.Id
                                    FROM dbo.CargoDependencia AS cde
                                    WHERE cde.CargoId = @CargoId
                                          AND cde.DependenciaId = @DependenciaId;
                                    IF @CargoDependenciaId IS NULL
                                        BEGIN
                                            -- Si el registro no existe se crea 
                                            INSERT INTO dbo.CargoDependencia
                                            (CargoId, 
                                             DependenciaId, 
                                             EstadoRegistro, 
                                             CreadoPor, 
                                             FechaCreacion
                                            )
                                            VALUES
                                            (@CargoId, 
                                             @DependenciaId, 
                                             'Activo', 
                                             'sistema', 
                                             GETDATE()
                                            );
                                            SELECT @CargoDependenciaId = SCOPE_IDENTITY();
                                    END;
                            END;
                            SELECT @CargoGrupoId = cde.Id
                            FROM dbo.CargoGrupo AS cde
                            WHERE cde.CargoId = @CargoId
                                  AND cde.Defecto = 1;

                            -- C�lculo del periodo de prueba
                            SET @DiasContrato = DATEDIFF(day, @FechaInicio, @FechaFinalizacion);
                            SET @PeriodoPrueba = @DiasContrato / 5;
                            IF @PeriodoPrueba > 60
                                BEGIN
                                    SET @PeriodoPrueba = 60;
                            END;
                            IF @PeriodoPrueba < 0
                                BEGIN
                                    SET @PeriodoPrueba = 0;
                            END;

                            -- Obtener el identificador del centro de costo del funcionario
                            SELECT @CentroCostoId = cc.Id
                            FROM CentroCosto AS cc
                            WHERE cc.Codigo = @CentroCosto;

                            -- Se ajusta el tipo de contrato seg�n criterios adicionales
                            -- Tipo de contrato salario integral
                            IF EXISTS
                            (
                                SELECT DEV_SAL_INTEGRAL
                                FROM alcanos.alcanos.COTIZANTE
                                WHERE empleado = @NumeroDocumento
                                      AND DEV_SAL_INTEGRAL = 'S'
                            )
                                BEGIN
                                    SET @TipoContratoId = 5;
                            END;

                            -- Tipo de contrato salario variable
                            IF EXISTS
                            (
                                SELECT DISTINCT 
                                       EMPLEADO
                                FROM alcanos.alcanos.EMPLEADO_CONC_NOMI
                                WHERE EMPLEADO = @NumeroDocumento
                                      AND CONCEPTO = 'QUIN-B210'
                                      AND NOMINA = 'COME'
                            )
                                BEGIN
                                    SET @TipoContratoId = 6;
                            END;

                            -- Definir el estado del contrato
                            IF @EstadoContrato = 'Terminado'
                                BEGIN
                                    -- Se actualiza el estado del funcionario a Retirado
                                    UPDATE dbo.Funcionario
                                      SET 
                                          Estado = 'Retirado'
                                    WHERE Id = @FuncionarioId;

                                    -- Se establece la fecha de terminaci�n
                                    SET @FechaTerminacion = @FechaFinalizacion;
                            END;
                                ELSE
                                BEGIN

                                    -- Se actualiza el estado del funcionario a activo
                                    UPDATE dbo.Funcionario
                                      SET 
                                          Estado = 'Activo'
                                    WHERE Id = @FuncionarioId;

                                    -- Se establece la fecha de terminaci�n
                                    SET @FechaTerminacion = NULL;
                            END;

                            -- Se obtiene la informaci�n del tipo de cotizante y subtipo de cotizante
                            SELECT @TipoCotizante = TIPO_COTIZANTE, 
                                   @SubTipoCotizante = (CASE SUBTIPO_COTIZANTE
                                                            WHEN 'ND'
                                                            THEN 0
                                                        END)
                            FROM alcanos.alcanos.COTIZANTE
                            WHERE EMPLEADO = @NumeroDocumento;
                            IF @TipoCotizante IS NULL
                                BEGIN
                                    SET @TipoCotizante = '01';
                            END;
                            IF @SubTipoCotizante IS NULL
                                BEGIN
                                    SET @SubTipoCotizante = '0';
                            END;
                            PRINT CONCAT('@TipoCotizante=', CONVERT(VARCHAR, @TipoCotizante));
                            PRINT CONCAT('@SubTipoCotizante=', CONVERT(VARCHAR, @SubTipoCotizante));

                            -- Se obtiene la relaci�n entre el tipo de cotizante y el subtipo de cotizantes
                            SELECT @TipoCotizanteSubtipoCotizanteId = Id
                            FROM dbo.TipoCotizanteSubtipoCotizante AS tcsc
                            WHERE tcsc.TipoCotizanteId =
                            (
                                SELECT Id
                                FROM dbo.TipoCotizante
                                WHERE Codigo = RIGHT('00' + CAST(@TipoCotizante AS VARCHAR(2)), 2)
                            )
                                  AND tcsc.SubtipoCotizanteId =
                            (
                                SELECT Id
                                FROM dbo.SubTipoCotizante
                                WHERE Codigo = @SubTipoCotizante
                            );

                            INSERT INTO [dbo].[Contrato]
                            ([FuncionarioId], 
                             [TipoContratoId], 
                             [Estado], 
                             [NumeroContrato], 
                             [CargoDependenciaId], 
                             [PeriodoPrueba], 
                             [FechaInicio], 
                             [FechaFinalizacion], 
                             [FechaTerminacion], 
                             [Sueldo], 
                             [CentroOperativoId], 
                             [DivisionPoliticaNivel2Id], 
                             [CentroCostoId], 
                             [FormaPagoId], 
                             [TipoMonedaId], 
                             [EntidadFinancieraId], 
                             [TipoCuentaId], 
                             [NumeroCuenta], 
                             [RecibeDotacion], 
                             [JornadaLaboralId], 
                             [EmpleadoConfianza], 
                             [Observaciones], 
                             [GrupoNominaId], 
                             [EstadoRegistro], 
                             [CreadoPor], 
                             [FechaCreacion], 
                             [CargoGrupoId], 
                             [TipoPeriodoId], 
                             ColombianoEnElExterior, 
                             ExtranjeroNoObligadoACotizarAPension, 
                             TipoCotizanteSubtipoCotizanteId, 
                             [ProcedimientoRetencion]
                            )
                            VALUES
                            (@FuncionarioId, 
                             @TipoContratoId, 
                             @EstadoContrato, 
                             @NumeroContrato, 
                             @CargoDependenciaId, 
                             @PeriodoPrueba, 
                             @FechaInicio, 
                             @FechaFinalizacion, 
                             @FechaTerminacion, 
                             @Sueldo, 
                             @CentroOperativoId, 
                             @DivisionPoliticaNivel2ResidenciaId, 
                             @CentroCostoId, 
                             @FormaPagoId, 
                             @TipoMonedaId, 
                             @EntidadFinancieraId, 
                             @TipoCuentaId, 
                             @NumeroCuenta, 
                             @RecibeDotacion, 
                             @JornadaLaboralId, 
                             @EmpleadoConfianza, 
                             @Observaciones, 
                             @GrupoNominaId, 
                             'Activo', 
                             @UsuarioOperacion, 
                             @FechaCreacion, 
                             @CargoGrupoId, 
                             @TipoPeriodoId, 
                             0, 
                             0, 
                             @TipoCotizanteSubtipoCotizanteId, 
                             @ProcedimientoRetencio
                            );

                            -- Se obtiene el id del contrato que se acabo de ingresar
                            SELECT @ContratoId = SCOPE_IDENTITY();
                            PRINT CONCAT('@EstadoContrato=', CONVERT(VARCHAR, @EstadoContrato));

							-- Si es centro de trabajo es 0, se le asigna un centro de trabajo por defecto
                            IF @CentroTrabajoId IS NULL
                               OR @CentroTrabajoId = 0
                                BEGIN
                                    SET @CentroTrabajoId = 1;
                            END;

                            -- Se registra en ContratoCentroTrabajo
                            INSERT INTO dbo.ContratoCentroTrabajo
                            (EstadoRegistro, 
                             CreadoPor, 
                             FechaCreacion, 
                             ContratoId, 
                             CentroTrabajoId, 
                             FechaInicio, 
                             FechaFin
                            )
                            VALUES
                            ('Activo', 
                             @UsuarioOperacion, 
                             @FechaCreacion, 
                             @ContratoId, 
                             @CentroTrabajoId, 
                             @FechaInicio, 
                             @FechaTerminacion
                            );

                            -- Se registran las administradoras asociadas al funcionario
                            IF @EstadoContrato = 'Vigente'
                                BEGIN
                                    PRINT CONCAT('Se consultan la administradoras', '');
                                    PRINT CONCAT('@NumeroDocumento=', CONVERT(VARCHAR, @NumeroDocumento));
                                    DECLARE cadministradoras CURSOR LOCAL
                                    FOR SELECT aco.Administradora, 
                                               aco.FECHA_INGRESO, 
                                               aco.FECHA_SALIDA
                                        FROM alcanos.alcanos.ADMIN_COTIZANTE AS aco
                                        WHERE aco.EMPLEADO = @NumeroDocumento;
                                    OPEN cadministradoras;
                                    FETCH NEXT FROM cadministradoras INTO @Administradora, @AdministradoraFechaInicio, @AdministradoraFechaFin;
                                    WHILE @@FETCH_STATUS = 0
                                        BEGIN

                                            -- Se consulta el equivalente de la administradora
                                            SELECT @AdministradoraId = eso.Ghestic
                                            FROM util._EquivalenciaSoftland AS eso
                                            WHERE eso.Entidad = 'Administradora'
                                                  AND eso.Softland = @Administradora;
                                            PRINT CONCAT('@Administradora=', CONVERT(VARCHAR, @Administradora));
                                            PRINT CONCAT('@AdministradoraId=', CONVERT(VARCHAR, @AdministradoraId));
                                            INSERT INTO dbo.ContratoAdministradora
                                            (ContratoId, 
                                             AdministradoraId, 
                                             FechaInicio, 
                                             FechaFin, 
                                             EstadoRegistro, 
                                             CreadoPor, 
                                             FechaCreacion
                                            )
                                            VALUES
                                            (@ContratoId, 
                                             @AdministradoraId, 
                                             @AdministradoraFechaInicio, 
                                             @AdministradoraFechaFin, 
                                             'Activo', 
                                             @UsuarioOperacion, 
                                             GETDATE()
                                            );
                                            FETCH NEXT FROM cadministradoras INTO @Administradora, @AdministradoraFechaInicio, @AdministradoraFechaFin;
                            END;
                                    CLOSE cadministradoras;
                                    DEALLOCATE cadministradoras;
                            END;
                            SET @ContadorContratos = @ContadorContratos + 1;
                    END;
                    FETCH NEXT FROM ccontrato INTO @TipoContratoId, @EstadoContrato, @Puesto, @Departamento, @FechaInicio, @FechaFinalizacion, @Sueldo, @CentroCosto, @FormaPagoId, @TipoMonedaId, @EntidadFinancieraId, @TipoCuentaId, @NumeroCuenta, @RecibeDotacion, @JornadaLaboralId, @EmpleadoConfianza, @ProcedimientoRetencio, @CentroTrabajoId, @Observaciones, @GrupoNomina, @FechaCreacion;
                END;
            CLOSE ccontrato;
            DEALLOCATE ccontrato;

            -- Se consulta el �ltimo contrato asociado al funcionario
            SELECT TOP 1 @ContratoId = con.Id
            FROM dbo.Contrato AS con
            WHERE con.FuncionarioId = @FuncionarioId
            ORDER BY con.FechaInicio DESC;

            -- Se marcan como terminados todos los contratos diferentes al �ltimo del funcionario
            UPDATE dbo.Contrato
              SET 
                  Estado = 'Terminado'
            WHERE FuncionarioId = @FuncionarioId
                  AND Id != @ContratoId;

            -- Cierre de la transacci�n
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