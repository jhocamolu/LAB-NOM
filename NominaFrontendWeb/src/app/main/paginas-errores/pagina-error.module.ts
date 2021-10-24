import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './permiso/list/list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatButtonModule, MatIconModule, MatCardModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { AutenticacionGuard } from '@guard/autenticacion.guard';

const routes: Routes = [
  {
    path: 'sin-permiso',
    loadChildren: () => import('./permiso/permiso.module').then(mod => mod.PermisoModule),
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
export class ErrorPageModule { }
