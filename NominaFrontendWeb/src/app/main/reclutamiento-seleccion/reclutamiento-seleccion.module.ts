import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';


const routes: Routes = [
  {
    path: 'requisiciones-personal',
    loadChildren: () => import('./requisiciones-personal/requisiciones-personal.module').then(mod => mod.RequisicionesPersonalModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'hojas-vida',
    loadChildren: () => import('./hojas-vida/hojas-vida.module').then(mod => mod.HojasVidaModule),
    canActivate: [AutenticacionGuard]
  },
];

@NgModule({
  declarations: [ ],
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
export class ReclutamientoSeleccionModule { }
