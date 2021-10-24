import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'cargar-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class InformacionComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  recibido: any;
  periodicidad: any[]; 
  constructor(
    public dialogRef: MatDialogRef<InformacionComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any
  ) {  }

  ngOnInit(): void {}

}
