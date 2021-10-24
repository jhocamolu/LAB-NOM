import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';
import { estadoSolicitudCesantiasAlcanos } from '@alcanos/constantes/estado-cesantias';

@Component({
  selector: 'solicitud-cesantias-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  estadoCesantias = estadoSolicitudCesantiasAlcanos;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico]],
      fechaSolicitud: [(this.element.fechaSolicitud) ? moment(this.element.fechaSolicitud).format('YYYY-MM-DD') : null, []],
      estado: [this.element.estado, []]
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
      ['/administracion-personal/solicitud-cesantias'],
      {
        queryParams: {
          $filter: true,
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const formValue = this.form.value;
    formValue.fechaSolicitud = formValue.fechaSolicitud ? moment(formValue.fechaSolicitud).format('YYYY-MM-DD') : null;

    this._router.navigate(
      ['/administracion-personal/solicitud-cesantias'],
      {
        queryParams: {
          $filter: toUrlEncoded(formValue),
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
