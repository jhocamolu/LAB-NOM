import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';


import { AlcanosPipesModule } from './pipes/pipes.module';
import { AlcanosEmptyStatesModule, AlcanosConfirmDialogModule, AlcanosDialogModule, AlcanosChartModule } from './components';
import { AlcanosSnackbarModule } from './services';
import { PermisosModule } from './services/permisos/permisos.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,
        AlcanosPipesModule,
        AlcanosConfirmDialogModule,
        AlcanosDialogModule,
        AlcanosEmptyStatesModule,
        AlcanosSnackbarModule,
        AlcanosChartModule,
        PermisosModule

    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,
        AlcanosPipesModule,
        AlcanosConfirmDialogModule,
        AlcanosSnackbarModule,
        AlcanosDialogModule,
        AlcanosEmptyStatesModule,
        AlcanosChartModule,
        PermisosModule

    ]
})
export class AlcanosSharedModule {
}
