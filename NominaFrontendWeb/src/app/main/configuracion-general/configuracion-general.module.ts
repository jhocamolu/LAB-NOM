import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';


const routes: Routes = [
  {
    path: 'terceros',
    loadChildren: () => import('./terceros/terceros.module').then(mod => mod.TercerosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'rangos-uvt',
    loadChildren: () => import('./rangos-uvt/rangos-uvt.module').then(mod => mod.RangosUvtModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'administradoras',
    loadChildren: () => import('./administradoras/administradoras.module').then(mod => mod.AdministradorasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'parametros',
    loadChildren: () => import('./parametros/parametros.module').then(mod => mod.ParametrosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'jornada-laborales',
    loadChildren: () => import('./jornada-laborales/jornada-laborales.module').then(mod => mod.JornadaLaboralesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'centro-trabajos',
    loadChildren: () => import('./centro-trabajos/centro-trabajos.module').then(mod => mod.CentroTrabajosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'idiomas',
    loadChildren: () => import('./idiomas/idiomas.module').then(mod => mod.IdiomasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'profesiones',
    loadChildren: () => import('./profesiones/profesiones.module').then(mod => mod.ProfesionesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'paises',
    loadChildren: () => import('./paises/paises.module').then(mod => mod.PaisesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-documentos',
    loadChildren: () => import('./tipo-documentos/tipo-documentos.module').then(mod => mod.TipoDocumentosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-periodos',
    loadChildren: () => import('./tipo-periodos/tipo-periodos.module').then(mod => mod.TipoPeriodosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-viviendas',
    loadChildren: () => import('./tipo-viviendas/tipo-viviendas.module').then(mod => mod.TipoViviendasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'estado-civiles',
    loadChildren: () => import('./estado-civiles/estado-civiles.module').then(mod => mod.EstadoCivilesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'ocupaciones',
    loadChildren: () => import('./ocupaciones/ocupaciones.module').then(mod => mod.OcupacionesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'forma-pagos',
    loadChildren: () => import('./forma-pagos/forma-pagos.module').then(mod => mod.FormaPagosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-monedas',
    loadChildren: () => import('./tipo-monedas/tipo-monedas.module').then(mod => mod.TipoMonedasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'compania',
    loadChildren: () => import('./compania/compania.module').then(mod => mod.CompaniaModule),
  },
  {
    path: 'nivel-cargos',
    loadChildren: () => import('./nivel-cargos/nivel-cargos.module').then(mod => mod.NivelCargosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'nivel-educativos',
    loadChildren: () => import('./nivel-educativos/nivel-educativos.module').then(mod => mod.NivelEducativosModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: 'calendario',
    loadChildren: () => import('./calendario/calendario.module').then(mod => mod.CalendarioModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-contratos',
    loadChildren: () => import('./tipo-contratos/tipo-contratos.module').then(mod => mod.TipoContratosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-ausentismos',
    loadChildren: () => import('./tipo-ausentismos/tipo-ausentismos.module').then(mod => mod.TipoAusentismosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'grupo-nominas',
    loadChildren: () => import('./grupo-nominas/grupo-nominas.module').then(mod => mod.GrupoNominasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-embargos',
    loadChildren: () => import('./tipo-embargos/tipo-embargos.module').then(mod => mod.TipoEmbargosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-soportes',
    loadChildren: () => import('./tipo-soportes/tipo-soportes.module').then(mod => mod.TipoSoportesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'entidad-financieras',
    loadChildren: () => import('./entidad-financieras/entidad-financieras.module').then(mod => mod.EntidadFinancierasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'diagnosticos',
    loadChildren: () => import('./diagnosticos/diagnosticos.module').then(mod => mod.DiagnosticosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'beneficios',
    loadChildren: () => import('./tipo-beneficio-corporativos/tipo-beneficio-corporativos.module').then(mod => mod.TipoBeneficiosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'cargos',
    loadChildren: () => import('./cargos/cargos.module').then(mod => mod.CargosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'dependencias',
    loadChildren: () => import('./dependencias/dependencias.module').then(mod => mod.DependenciasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'horas-extras',
    loadChildren: () => import('./horas-extras/horas-extras.module').then(mod => mod.HorasExtrasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'annos-trabajo',
    loadChildren: () => import('./annos-trabajo/annos-trabajos.module').then(mod => mod.AnnosTrabajosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'categoria-novedades',
    loadChildren: () => import('./categoria-novedades/categoria-novedades.module').then(mod => mod.CategoriaNovedadesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'gasto-viajes',
    loadChildren: () => import('./gasto-viajes/gasto-viajes.module').then(mod => mod.GastoViajesModule),
    canActivate: [AutenticacionGuard]
  },
  

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AutenticacionGuard]
  },

];

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatInputModule,
    MatTooltipModule,

    FuseSharedModule,
    //
    MatIconModule,
    MatCardModule,
  ]
})
export class ConfiguracionGeneralModule { }
