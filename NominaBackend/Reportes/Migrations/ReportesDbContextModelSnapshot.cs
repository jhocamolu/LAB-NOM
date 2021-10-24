﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Reportes.Infraestructura.DbContexto;

namespace Reportes.Migrations
{
    [DbContext(typeof(ReportesDbContext))]
    partial class ReportesDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Reportes.Models.Categoria", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Alias")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

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

                    b.HasKey("Id");

                    b.ToTable("Categoria");
                });

            modelBuilder.Entity("Reportes.Models.Parametro", b =>
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

                    b.Property<string>("TipoDato")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.ToTable("Parametro");
                });

            modelBuilder.Entity("Reportes.Models.Reporte", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Alias")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Alto")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Ancho")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Descripcion")
                        .IsRequired()
                        .HasColumnType("varchar(500)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<bool>("EsModal")
                        .HasColumnType("bit");

                    b.Property<string>("EstadoRegistro")
                        .HasColumnType("char(10)");

                    b.Property<string>("Extension")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<DateTime?>("FechaCreacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaEliminacion")
                        .HasColumnType("smalldatetime");

                    b.Property<DateTime?>("FechaModificacion")
                        .HasColumnType("smalldatetime");

                    b.Property<string>("Formato")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Link")
                        .IsRequired()
                        .HasColumnType("varchar(max)");

                    b.Property<string>("ModificadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<int>("SubcategoriaId")
                        .HasColumnType("int");

                    b.Property<string>("VistaGeneracion")
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("Alias")
                        .IsUnique();

                    b.HasIndex("SubcategoriaId");

                    b.ToTable("Reporte");
                });

            modelBuilder.Entity("Reportes.Models.ReporteParametro", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CreadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("EliminadoPor")
                        .HasColumnType("varchar(255)");

                    b.Property<bool>("EsRequerido")
                        .HasColumnType("bit");

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

                    b.Property<int>("ParametroId")
                        .HasColumnType("int");

                    b.Property<int>("ReporteId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ParametroId");

                    b.HasIndex("ReporteId");

                    b.ToTable("ReporteParametro");
                });

            modelBuilder.Entity("Reportes.Models.Subcategoria", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CategoriaId")
                        .HasColumnType("int");

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

                    b.HasIndex("CategoriaId");

                    b.ToTable("Subcategoria");
                });

            modelBuilder.Entity("Reportes.Models.Reporte", b =>
                {
                    b.HasOne("Reportes.Models.Subcategoria", "Subcategoria")
                        .WithMany()
                        .HasForeignKey("SubcategoriaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Reportes.Models.ReporteParametro", b =>
                {
                    b.HasOne("Reportes.Models.Parametro", "Parametro")
                        .WithMany()
                        .HasForeignKey("ParametroId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Reportes.Models.Reporte", "Reporte")
                        .WithMany()
                        .HasForeignKey("ReporteId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();
                });

            modelBuilder.Entity("Reportes.Models.Subcategoria", b =>
                {
                    b.HasOne("Reportes.Models.Categoria", "Categoria")
                        .WithMany()
                        .HasForeignKey("CategoriaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
