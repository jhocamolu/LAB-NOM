import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then(mod => mod.NotificacionesModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tareas-programadas',
    loadChildren: () => import('./tareas-programadas/tareas-programadas.module').then(mod => mod.TareasProgramadasModule),
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
export class MantenimientoModule { }
