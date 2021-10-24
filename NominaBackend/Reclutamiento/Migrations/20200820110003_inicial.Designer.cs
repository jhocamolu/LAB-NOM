﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Reclutamiento.Infraestructura.DbContexto;

namespace Reclutamiento.Migrations
{
    [DbContext(typeof(ReclutamientoDbContext))]
    [Migration("20200820110003_inicial")]
    partial class inicial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasDefaultSchema("reclutamiento")
                .HasAnnotation("ProductVersion", "3.1.7")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("ApiV3.Models.ClaseLibretaMilitar", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("ClaseLibretaMilitar");
                });

            modelBuilder.Entity("ApiV3.Models.DivisionPoliticaNivel1", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<int>("PaisId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("PaisId");

                    b.ToTable("DivisionPoliticaNivel1");
                });

            modelBuilder.Entity("ApiV3.Models.DivisionPoliticaNivel2", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("DivisionPoliticaNivel1Id")
                        .HasColumnType("int");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("DivisionPoliticaNivel1Id");

                    b.ToTable("DivisionPoliticaNivel2");
                });

            modelBuilder.Entity("ApiV3.Models.EstadoCivil", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("EstadoCivil");
                });

            modelBuilder.Entity("ApiV3.Models.HojaDeVida", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Adjunto")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Celular")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<int?>("ClaseLibretaMilitarId")
                        .HasColumnType("int");

                    b.Property<string>("CorreoElectronicoPersonal")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("DigitoVerificacion")
                        .HasColumnType("int");

                    b.Property<string>("Direccion")
                        .HasColumnType("varchar(255)");

                    b.Property<int?>("Distrito")
                        .HasColumnType("int");

                    b.Property<int>("DivisionPoliticaNivel2ExpedicionDocumentoId")
                        .HasColumnType("int");

                    b.Property<int>("DivisionPoliticaNivel2OrigenId")
                        .HasColumnType("int");

                    b.Property<int>("DivisionPoliticaNivel2ResidenciaId")
                        .HasColumnType("int");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("EstadoCivilId")
                        .HasColumnType("int");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime>("FechaExpedicionDocumento")
                        .HasColumnType("date");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime>("FechaNacimiento")
                        .HasColumnType("date");

                    b.Property<DateTime?>("LicenciaConduccionAFechaVencimiento")
                        .HasColumnType("date");

                    b.Property<int?>("LicenciaConduccionAId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("LicenciaConduccionBFechaVencimiento")
                        .HasColumnType("date");

                    b.Property<int?>("LicenciaConduccionBId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("LicenciaConduccionCFechaVencimiento")
                        .HasColumnType("date");

                    b.Property<int?>("LicenciaConduccionCId")
                        .HasColumnType("int");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nit")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<double?>("NumeroCalzado")
                        .HasColumnType("float");

                    b.Property<string>("NumeroDocumento")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("NumeroLibreta")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("OcupacionId")
                        .HasColumnType("int");

                    b.Property<bool>("Pensionado")
                        .HasColumnType("bit");

                    b.Property<string>("PrimerApellido")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("PrimerNombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("SegundoApellido")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("SegundoNombre")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("SexoId")
                        .HasColumnType("int");

                    b.Property<string>("TallaCamisa")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("TallaPantalon")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("TelefonoFijo")
                        .HasColumnType("varchar(255)");

                    b.Property<int>("TipoDocumentoId")
                        .HasColumnType("int");

                    b.Property<int>("TipoSangreId")
                        .HasColumnType("int");

                    b.Property<int>("TipoViviendaId")
                        .HasColumnType("int");

                    b.Property<bool>("UsaLentes")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("ClaseLibretaMilitarId");

                    b.HasIndex("DivisionPoliticaNivel2ExpedicionDocumentoId");

                    b.HasIndex("DivisionPoliticaNivel2OrigenId");

                    b.HasIndex("DivisionPoliticaNivel2ResidenciaId");

                    b.HasIndex("EstadoCivilId");

                    b.HasIndex("LicenciaConduccionAId");

                    b.HasIndex("LicenciaConduccionBId");

                    b.HasIndex("LicenciaConduccionCId");

                    b.HasIndex("OcupacionId");

                    b.HasIndex("SexoId");

                    b.HasIndex("TipoDocumentoId");

                    b.HasIndex("TipoSangreId");

                    b.HasIndex("TipoViviendaId");

                    b.ToTable("HojaDeVida","dbo");
                });

            modelBuilder.Entity("ApiV3.Models.LicenciaConduccion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Clase")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("LicenciaConduccion");
                });

            modelBuilder.Entity("ApiV3.Models.Ocupacion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("varchar(10)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("Ocupacion");
                });

            modelBuilder.Entity("ApiV3.Models.Pais", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Codigo")
                        .IsRequired()
                        .HasColumnType("varchar(10)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nacionalidad")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("Pais");
                });

            modelBuilder.Entity("ApiV3.Models.Sexo", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("Sexo","dbo");
                });

            modelBuilder.Entity("ApiV3.Models.TipoDocumento", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CodigoDian")
                        .IsRequired()
                        .HasColumnType("varchar(10)");

                    b.Property<string>("CodigoPila")
                        .IsRequired()
                        .HasColumnType("varchar(10)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("Formato")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Validacion")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("TipoDocumento","dbo");
                });

            modelBuilder.Entity("ApiV3.Models.TipoSangre", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("TipoSangre");
                });

            modelBuilder.Entity("ApiV3.Models.TipoVivienda", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("TipoVivienda");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedName")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("Reclutamiento.Models.UsuarioAplicacion", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<int>("HojaDeVidaId")
                        .HasColumnType("int");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedUserName")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasColumnType("nvarchar(256)")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("HojaDeVidaId");

                    b.HasIndex("NormalizedEmail")
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("ApiV3.Models.DivisionPoliticaNivel1", b =>
                {
                    b.HasOne("ApiV3.Models.Pais", "Pais")
                        .WithMany()
                        .HasForeignKey("PaisId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ApiV3.Models.DivisionPoliticaNivel2", b =>
                {
                    b.HasOne("ApiV3.Models.DivisionPoliticaNivel1", "DivisionPoliticaNivel1")
                        .WithMany()
                        .HasForeignKey("DivisionPoliticaNivel1Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ApiV3.Models.HojaDeVida", b =>
                {
                    b.HasOne("ApiV3.Models.ClaseLibretaMilitar", "ClaseLibretaMilitar")
                        .WithMany()
                        .HasForeignKey("ClaseLibretaMilitarId");

                    b.HasOne("ApiV3.Models.DivisionPoliticaNivel2", "DivisionPoliticaNivel2ExpedicionDocumento")
                        .WithMany()
                        .HasForeignKey("DivisionPoliticaNivel2ExpedicionDocumentoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.DivisionPoliticaNivel2", "DivisionPoliticaNivel2Origen")
                        .WithMany()
                        .HasForeignKey("DivisionPoliticaNivel2OrigenId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.DivisionPoliticaNivel2", "DivisionPoliticaNivel2Residencia")
                        .WithMany()
                        .HasForeignKey("DivisionPoliticaNivel2ResidenciaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.EstadoCivil", "EstadoCivil")
                        .WithMany()
                        .HasForeignKey("EstadoCivilId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.LicenciaConduccion", "LicenciaConduccionA")
                        .WithMany()
                        .HasForeignKey("LicenciaConduccionAId");

                    b.HasOne("ApiV3.Models.LicenciaConduccion", "LicenciaConduccionB")
                        .WithMany()
                        .HasForeignKey("LicenciaConduccionBId");

                    b.HasOne("ApiV3.Models.LicenciaConduccion", "LicenciaConduccionC")
                        .WithMany()
                        .HasForeignKey("LicenciaConduccionCId");

                    b.HasOne("ApiV3.Models.Ocupacion", "Ocupacion")
                        .WithMany()
                        .HasForeignKey("OcupacionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.Sexo", "Sexo")
                        .WithMany()
                        .HasForeignKey("SexoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.TipoDocumento", "TipoDocumento")
                        .WithMany()
                        .HasForeignKey("TipoDocumentoId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.TipoSangre", "TipoSangre")
                        .WithMany()
                        .HasForeignKey("TipoSangreId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ApiV3.Models.TipoVivienda", "TipoVivienda")
                        .WithMany()
                        .HasForeignKey("TipoViviendaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Reclutamiento.Models.UsuarioAplicacion", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Reclutamiento.Models.UsuarioAplicacion", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Reclutamiento.Models.UsuarioAplicacion", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Reclutamiento.Models.UsuarioAplicacion", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Reclutamiento.Models.UsuarioAplicacion", b =>
                {
                    b.HasOne("ApiV3.Models.HojaDeVida", "HojaDeVida")
                        .WithMany()
                        .HasForeignKey("HojaDeVidaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}