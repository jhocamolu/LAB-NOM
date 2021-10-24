SET IDENTITY_INSERT [dbo].[NivelCargo] ON
GO
INSERT INTO dbo.NivelCargo (Id,Nombre, EstadoRegistro, CreadoPor, FechaCreacion) VALUES(1,'Estratégico', 'Activo','sistema',GETDATE());
INSERT INTO dbo.NivelCargo (Id,Nombre, EstadoRegistro, CreadoPor, FechaCreacion) VALUES(2,'Operativo', 'Activo','sistema',GETDATE());
INSERT INTO dbo.NivelCargo (Id,Nombre, EstadoRegistro, CreadoPor, FechaCreacion) VALUES(3,'Táctico 1', 'Activo','sistema',GETDATE());
INSERT INTO dbo.NivelCargo (Id,Nombre, EstadoRegistro, CreadoPor, FechaCreacion) VALUES(4,'Táctico 2', 'Activo','sistema',GETDATE());
SET IDENTITY_INSERT [dbo].[NivelCargo] OFF
GO