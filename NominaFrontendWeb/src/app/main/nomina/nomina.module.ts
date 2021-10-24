import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';


const routes: Routes = [
  {
    path: 'concepto-nominas',
    loadChildren: () => import('./concepto-nominas/concepto-nominas.module').then(mod => mod.ConceptoNominasModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'distribucion-costos',
    loadChildren: () => import('./distribucion-costos/distribucion-costos.module').then(mod => mod.DistribucionCostosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'tipo-liquidaciones',
    loadChildren: () => import('./tipo-liquidaciones/tipo-liquidaciones.module').then(mod => mod.TipoLiquidacionesModule),
  },
  {
    path: 'liquidacion-nomina',
    loadChildren: () => import('./liquidacion-nomina/liquidacion-nomina.module').then(mod => mod.LiquidacionNominaModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'proceso-costos',
    loadChildren: () => import('./proceso-costos/proceso-costos.module').then(mod => mod.ProcesarCostosModule),
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'costos-cargo',
    loadChildren: () => import('./costos-cargo/costos-cargo.module').then(mod => mod.CostosCargoModule),
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
export class NominaModule { }
