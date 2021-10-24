import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'libro',
    loadChildren: () => import('./libro-vacaciones/libro-vacaciones.module').then(mod => mod.LibroVacacionesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'solicitudes',
    loadChildren: () => import('./solicitud-vacaciones/solicitud-vacaciones.module').then(mod => mod.SolicitudVacacionesModule),
    canActivate: [AutenticacionGuard]
  },
  
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class VacacionesModule { }
