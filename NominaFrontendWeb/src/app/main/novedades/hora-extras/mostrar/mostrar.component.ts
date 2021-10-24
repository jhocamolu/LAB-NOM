import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
import { ListarService } from '../listar/listar.service';
import { tipoHoraExtra, tipoHoraExtraMostrar } from '@alcanos/constantes/tipo-hora-extra';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'hora-extras-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent {

  horaExtra = tipoHoraExtra;
  horaExtraM = tipoHoraExtraMostrar;

  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarService,
  ) {
  }


}
