import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'funcionarios-mostrar-estudios',
  templateUrl: './mostrar-estudios.component.html',
  styleUrls: ['./mostrar-estudios.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarEstudiosComponent  {

  item: any;

  constructor(
    public dialogRef: MatDialogRef<MostrarEstudiosComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
  ) { 
  }

 

}
