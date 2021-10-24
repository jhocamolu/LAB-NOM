import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';


const routes: Routes = [
  {
    path: 'funcionarios',
    loadChildren: () => import('./funcionarios/funcionarios.module').then(mod => mod.FuncionariosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'contratos',
    loadChildren: () => import('./contratos/contratos.module').then(mod => mod.ContratosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'permisos',
    loadChildren: () => import('./permisos/permisos.module').then(mod => mod.PermisosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'solicitud-cesantias',
    loadChildren: () => import('./solicitud-cesantias/solicitud-cesantias.module').then(mod => mod.SolicitudCesantiasModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: 'cambio-administradora',
    loadChildren: () => import('./cambio-administradoras/cambio-administradoras.module').then(mod => mod.CambioAdministradorasModule),
    canActivate: [AutenticacionGuard]
  },

  {
    path: 'cambio-centro-trabajos',
    loadChildren: () => import('./cambios-centro-trabajos/cambios-centro-trabajos.module').then(mod => mod.CambiosCentroTrabajosModule),
    canActivate: [AutenticacionGuard]
  },

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
export class AdministracionPersonalModule { }
