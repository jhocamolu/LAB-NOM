import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'entidad-financieras-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent {

  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { }


}
