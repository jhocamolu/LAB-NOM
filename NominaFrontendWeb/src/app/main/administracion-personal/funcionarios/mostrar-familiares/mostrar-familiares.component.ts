import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'funcionarios-mostrar-familiares',
  templateUrl: './mostrar-familiares.component.html',
  styleUrls: ['./mostrar-familiares.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarFamiliaresComponent {

  item: any;

  constructor(
    public dialogRef: MatDialogRef<MostrarFamiliaresComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { }


}
