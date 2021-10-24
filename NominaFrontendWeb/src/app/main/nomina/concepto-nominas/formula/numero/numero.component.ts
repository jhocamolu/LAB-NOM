import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'formula-numero',
  templateUrl: './numero.component.html',
  styleUrls: ['./numero.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NumeroComponent implements OnInit {


  form: FormGroup;


  constructor(
    public dialogRef: MatDialogRef<NumeroComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder, ) {
    this.form = this._formBuilder.group({
      numero: [element, [Validators.required, AlcanosValidators.decimal]]
    });
  }

  ngOnInit(): void {
  }

  agregarHandle(event): void {
    this.dialogRef.close(this.form.value.numero);
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

}
