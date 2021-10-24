import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';

@Component({
  selector: 'forma-pagos-filtro',
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
    private _matSnackBar: MatSnackBar,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      desde: [this.element.desde, [AlcanosValidators.numerico, Validators.max(99999)]],
      hasta: [this.element.hasta, [AlcanosValidators.numerico, Validators.max(99999)]],
      porcentaje: [this.element.porcentaje, [AlcanosValidators.numerico, Validators.max(100)]],
      adiciona: [this.element.adiciona, [AlcanosValidators.numerico, Validators.max(10000)]],
      sustrae: [this.element.sustrae, [AlcanosValidators.numerico, Validators.max(10000)]],
      validoDesde: [(this.element.validoDesde) ? moment(this.element.validoDesde).format('YYYY-MM-DD') : null, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get desde(): AbstractControl {
    return this.form.get('desde');
  }

  get hasta(): AbstractControl {
    return this.form.get('hasta');
  }

  get porcentaje(): AbstractControl {
    return this.form.get('porcentaje');
  }

  get adiciona(): AbstractControl {
    return this.form.get('adiciona');
  }

  get sustrae(): AbstractControl {
    return this.form.get('sustrae');
  }
  get validoDesde(): AbstractControl {
    return this.form.get('validoDesde');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/rangos-uvt'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close({});

  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const formValue = this.form.value;
    formValue.validoDesde = formValue.validoDesde ? moment(formValue.validoDesde).format('YYYY-MM-DD') : null;

    this._router.navigate(
      ['/configuracion/rangos-uvt'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close(this.form.value);

  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


}
