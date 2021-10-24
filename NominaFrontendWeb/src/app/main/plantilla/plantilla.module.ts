import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'documentos',
    loadChildren: () => import('./documentos/documentos.module').then(mod => mod.DocumentosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'complementos',
    loadChildren: () => import('./complementos/complementos.module').then(mod => mod.ComplementosModule),
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
export class PlantillaModule { }
