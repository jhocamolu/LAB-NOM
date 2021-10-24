import { Component, ViewEncapsulation, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'hojas-vida-mostrar-experiencias',
  templateUrl: './mostrar-experiencias.component.html',
  styleUrls: ['./mostrar-experiencias.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarExperienciasComponent  {

  item: any;

  constructor(
    public dialogRef: MatDialogRef<MostrarExperienciasComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { }
}
