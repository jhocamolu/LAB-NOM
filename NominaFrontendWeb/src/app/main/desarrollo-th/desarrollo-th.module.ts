import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'beneficios',
    loadChildren: () => import('./beneficios-corpo/beneficios-corpo.module').then(mod => mod.BeneficiosCorpoModule),
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
export class DesarrolloTHModule { }
