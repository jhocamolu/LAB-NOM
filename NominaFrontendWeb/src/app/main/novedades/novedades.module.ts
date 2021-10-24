import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';


const routes: Routes = [
    {
        path: 'ausentismos',
        loadChildren: () => import('./ausentismos/ausentismos.module').then(mod => mod.AusentismosModule),
        canActivate: [AutenticacionGuard]
    },
    {
        path: 'libranzas',
        loadChildren: () => import('./libranzas/libranzas.module').then(mod => mod.LibranzasModule),
        canActivate: [AutenticacionGuard]
    },
    {
        path: 'embargos',
        loadChildren: () => import('./embargos/embargos.module').then(mod => mod.EmbargosModule),
        canActivate: [AutenticacionGuard]
    },
    {
        path: 'otra-novedades',
        loadChildren: () => import('./otra-novedades/otra-novedades.module').then(mod => mod.OtraNovedadesModule),
        canActivate: [AutenticacionGuard]
    },
    {
        path: 'gastos-viaje',
        loadChildren: () => import('./gastos-viaje/gastos-viaje.module').then(mod => mod.GastosViajeModule),
        canActivate: [AutenticacionGuard]
    },
    {
        path: 'hora-extras',
        loadChildren: () => import('./hora-extras/hora-extras.module').then(mod => mod.HoraExtrasModule),
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
export class NovedadesModule { }
