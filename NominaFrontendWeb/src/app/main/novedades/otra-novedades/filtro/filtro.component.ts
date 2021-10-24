import { Component, OnInit, Optional, Inject, ViewEncapsulation } from '@angular/core';
import { estadoNovedades } from '@alcanos/constantes/clase-novedades';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'otra-novedades-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  estadoNovedad = estadoNovedades;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      criterioBusqueda: [this.element.criterioBusqueda, []],
      novedad: [this.element.novedad, []],
      fechaAplicacion: [(this.element.fechaAplicacion) ? moment(this.element.fechaAplicacion).format('YYYY-MM-DD') : null, []],
      estado: [this.element.estado, []]
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get numeroDocumentoFuncionario(): AbstractControl {
    return this.form.get('numeroDocumentoFuncionario');
  }
  get primerNombre(): AbstractControl {
    return this.form.get('primerNombre');
  }
  get primerApellido(): AbstractControl {
    return this.form.get('primerApellido');
  }
  get fechaAplicacion(): AbstractControl {
    return this.form.get('fechaAplicacion');
  }
  get estado(): AbstractControl {
    return this.form.get('estado');
  }
  get novedad(): AbstractControl {
    return this.form.get('novedad');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/novedades/otra-novedades'],
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
    formValue.fechaAplicacion = formValue.fechaAplicacion ? moment(formValue.fechaAplicacion).format('YYYY-MM-DD') : null;

    this._router.navigate(
      ['/novedades/otra-novedades'],
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
