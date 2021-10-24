﻿// <auto-generated />
using System;
using Ayuda.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Ayuda.Migrations
{
    [DbContext(typeof(AyudaDbContext))]
    partial class AyudaDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Ayuda.Models.Articulo", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CategoriaId");

                    b.Property<string>("Descripcion")
                        .IsRequired();

                    b.Property<string>("EstadoRegistro")
                        .IsRequired();

                    b.Property<DateTime>("FechaCreacion");

                    b.Property<DateTime?>("FechaEliminacion");

                    b.Property<DateTime>("FechaModificacion");

                    b.Property<int>("Orden");

                    b.Property<string>("Titulo")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("CategoriaId");

                    b.ToTable("Articulo");
                });

            modelBuilder.Entity("Ayuda.Models.ArticuloClave", b =>
                {
                    b.Property<int>("ClaveId");

                    b.Property<int>("ArticuloId");

                    b.HasKey("ClaveId", "ArticuloId");

                    b.HasIndex("ArticuloId");

                    b.ToTable("ArticuloClave");
                });

            modelBuilder.Entity("Ayuda.Models.Categoria", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("CategoriaId");

                    b.Property<string>("EstadoRegistro")
                        .IsRequired();

                    b.Property<DateTime>("FechaCreacion");

                    b.Property<DateTime?>("FechaEliminacion");

                    b.Property<DateTime>("FechaModificacion");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<int>("Orden");

                    b.HasKey("Id");

                    b.HasIndex("CategoriaId");

                    b.ToTable("Categoria");
                });

            modelBuilder.Entity("Ayuda.Models.Clave", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Palabra")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.ToTable("Clave");
                });

            modelBuilder.Entity("Ayuda.Models.Articulo", b =>
                {
                    b.HasOne("Ayuda.Models.Categoria", "Categoria")
                        .WithMany()
                        .HasForeignKey("CategoriaId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Ayuda.Models.ArticuloClave", b =>
                {
                    b.HasOne("Ayuda.Models.Articulo", "Articulo")
                        .WithMany("ArticuloClaves")
                        .HasForeignKey("ArticuloId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Ayuda.Models.Clave", "Clave")
                        .WithMany("ArticuloClaves")
                        .HasForeignKey("ClaveId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Ayuda.Models.Categoria", b =>
                {
                    b.HasOne("Ayuda.Models.Categoria", "Padre")
                        .WithMany("Categorias")
                        .HasForeignKey("CategoriaId");
                });
#pragma warning restore 612, 618
        }
    }
}
