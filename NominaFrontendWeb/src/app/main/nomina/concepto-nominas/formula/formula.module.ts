import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatListModule, MatDividerModule, MatInputModule, MatMenuModule, MatTooltipModule } from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { FormulaComponent } from './formula.component';
import { CondicionComponent } from './condicion/condicion.component';
import { ConceptoComponent } from './concepto/concepto.component';
import { FuncionComponent } from './funcion/funcion.component';
import { AyudaComponent } from './ayuda/ayuda.component';
import { NumeroComponent } from './numero/numero.component';
import { ProbarComponent } from './probar/probar.component';


@NgModule({
  declarations: [FormulaComponent, CondicionComponent, ConceptoComponent, FuncionComponent, AyudaComponent, NumeroComponent, ProbarComponent],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    CommonModule,
    FuseSharedModule,
  ],
  exports: [
    FormulaComponent
  ],
  entryComponents: [
    CondicionComponent, ConceptoComponent, FuncionComponent, NumeroComponent, AyudaComponent, ProbarComponent
  ]
})
export class FormulaModule { }
