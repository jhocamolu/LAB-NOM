import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'entidad-financieras-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,

  ) { 
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      nombre: [this.element.nombre, [AlcanosValidators.maxLength(80)]],
      codigo: [this.element.codigo, [AlcanosValidators.numerico, Validators.max(999)]],
      nit: [this.element.nit, [AlcanosValidators.numerico, Validators.max(9999999999)]],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }


  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/entidad-financieras'],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const formValue = this.form.value;
    formValue.fechaInicio = formValue.fechaInicio  ?  moment(formValue.fechaInicio).format('YYYY-MM-DD') : null; 

    this._router.navigate(
      ['/configuracion/entidad-financieras'],
      {
        queryParams: {
          $filter: toUrlEncoded(formValue),
          $top: 5,
          $skip: 0,
        },
      });
    this.dialogRef.close(this.form.value);

  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


}
