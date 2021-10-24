import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';


import { AlcanosPipesModule } from './pipes/pipes.module';
import { AlcanosEmptyStatesModule, AlcanosConfirmDialogModule, AlcanosDialogModule, AlcanosChartModule } from './components';
import { AlcanosSnackbarModule } from './services';


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

    ]
})
export class AlcanosSharedModule {
}
