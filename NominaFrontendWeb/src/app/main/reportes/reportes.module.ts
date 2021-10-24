import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: ':alias/dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/pagina',
    loadChildren: () => import('./pruebas/pruebas.module').then(mod => mod.PruebasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/maestro-funcionarios',
    loadChildren: () => import('./administracion-personal/maestro-empleados/maestro-empleados.module').then(mod => mod.MaestroEmpleadosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/planta-personal',
    loadChildren: () => import('./administracion-personal/planta-personal/planta-personal.module').then(mod => mod.PlantaPersonalModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/bitacora-nomina',
    loadChildren: () => import('./nomina/bitacora/bitacora.module').then(mod => mod.BitacoraModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: ':alias/archivo-dispersion',
    loadChildren: () => import('./nomina/archivo-dispersion/archivo-dispersion.module').then(mod => mod.ArchivoDispersionModule),
    canActivate: [AutenticacionGuard]
  },
 
  {
    path: ':alias/novedades-embargo',
    loadChildren: () => import('./nomina/embargos/embargos.module').then(mod => mod.EmbargosReporteModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/novedades-libranza',
    loadChildren: () => import('./nomina/libranzas/libranzas.module').then(mod => mod.LibranzasReporteModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/consolidado-conceptos-nomina',
    loadChildren: () => import('./nomina/consolidado/consolidado.module').then(mod => mod.ConsolidadoModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/regreso-vacaciones-ausentismos',
    loadChildren: () => import('./administracion-personal/regreso-vacaciones-ausentismos/regreso-vacaciones-ausentismos.module').then(mod => mod.RegresoVacacionesAusentismosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/familiares-funcionario',
    loadChildren: () => import('./administracion-personal/familiares-funcionario/familiares-funcionario.module').then(mod => mod.FamiliaresFuncionarioModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: ':alias/ausentismo-laboral',
    loadChildren: () => import('./administracion-personal/ausentismo-laboral/ausentismo-laboral.module').then(mod => mod.AusentismoLaboralModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: ':alias/beneficio-corporativo',
    loadChildren: () => import('./administracion-personal/beneficio-corporativo/beneficio-corporativo.module').then(mod => mod.BeneficioCorporativoModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: ':alias/prorroga-contrato-termino-fijo',
    loadChildren: () => import('./administracion-personal/prorroga-contratos/prorroga-contratos.module').then(mod => mod.ProrrogaContratosModule),
    canActivate: [AutenticacionGuard]
  },
  
  {
    path: ':alias/archivo-tipo-2-pila',
    loadChildren: () => import('./nomina/archivo-pila-dos/crear.module').then(mod => mod.ArchivoTipo2PilaModule),
    canActivate: [AutenticacionGuard]
  }

];

@NgModule({
  declarations: [],
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
export class ReportesModule { }
