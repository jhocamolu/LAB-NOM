CREATE TABLE util.[EquivalenteNovedad] (	
	Id varchar(255) NOT NULL,
	Concepto varchar(255) NOT NULL,
	NombreConceptoSoftland varchar(255) NOT NULL,
	ConceptoNominaId varchar(255) NOT NULL,
	CategoriaId varchar(255) NOT NULL,
	NombreCategoria varchar(255) NOT NULL,
	Modulo varchar(255) NOT NULL,
	EstadoRegistro varchar(255) NOT NULL,
	CreadoPor varchar(255) NOT NULL,
	FechaCreacion smalldatetime NOT NULL,	
	CONSTRAINT PK_EquivalenciaSoftland PRIMARY KEY (Id)
) GO;