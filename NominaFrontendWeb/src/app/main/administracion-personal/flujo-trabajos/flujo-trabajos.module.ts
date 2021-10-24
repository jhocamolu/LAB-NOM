import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'sustitutos',
    loadChildren: () => import('./sustitutos/sustitutos.module').then(mod => mod.SustitutosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'vistos-buenos',
    loadChildren: () => import('./vistos-buenos/vistos-buenos.module').then(mod => mod.VistosBuenosModule),
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
export class FlujoTrabajosModule { }
