	UPDATE dbo.Contrato 
	SET Estado = 'Vigente', FechaFinalizacion = '2020-12-31'
	WHERE Estado = 'Finalizado'
	AND FechaFinalizacion > '2019-01-01'
	AND FuncionarioId NOT IN (SELECT FuncionarioId FROM dbo.Contrato WHERE Estado IN ('Vigente'))

	UPDATE dbo.Funcionario 
	SET Estado = 'Activo'
	WHERE Id IN (SELECT FuncionarioId FROM dbo.Contrato con WHERE con.Estado = 'Vigente')
	
	UPDATE dbo.Funcionario 
	SET Estado = 'Retirado'
	WHERE Id IN (SELECT FuncionarioId FROM dbo.Contrato con WHERE con.Estado = 'Finalizado')
	AND Id NOT IN (SELECT FuncionarioId FROM dbo.Contrato WHERE Estado IN ('Vigente'))
	
	UPDATE dbo.Contrato 
	SET FechaTerminacion = FechaFinalizacion
	WHERE Estado = 'Finalizado'
	