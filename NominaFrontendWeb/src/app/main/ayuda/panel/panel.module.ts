import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseSharedModule } from '@fuse/shared.module';
import {
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatListModule,
    MatToolbarModule,
    MatProgressSpinnerModule
} from '@angular/material';
import { VentanaComponent } from './ventana/ventana.component';
import { CategoriaComponent } from './categorias/categoria.component';
import { HomeComponent } from './home/home.component';
import { ButtomComponent } from './buttom/buttom.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';


@NgModule({
    declarations: [
        ButtomComponent,
        VentanaComponent,
        HomeComponent,
        CategoriaComponent,
    ],
    imports: [
        CommonModule,

        MatProgressSpinnerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatButtonModule,
        MatDatepickerModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
        MatListModule,
        MatToolbarModule,

        //
        FuseSharedModule,
        AlcanosSharedModule,
    ],
    entryComponents: [
        VentanaComponent
    ],
    exports: [
        ButtomComponent
    ]
})
export class AyudaPanelModule { }
