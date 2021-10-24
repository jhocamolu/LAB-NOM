CREATE TABLE util.TemporalCargo (
	Id int IDENTITY(1,1) NOT NULL,
	Codigo varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NivelCargo varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Nombre varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Clase varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ObjetivoCargo varchar(600) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Dependencia varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CargoJefeInmediato varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OtroCargoReporta varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Cargo PRIMARY KEY (Id)
) GO
