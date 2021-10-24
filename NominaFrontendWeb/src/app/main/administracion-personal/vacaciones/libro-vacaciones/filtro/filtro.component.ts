import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import * as moment from 'moment';
import { estadoLibranzasAlcanos } from '@alcanos/constantes/estado-libranzas';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'vacaciones-filtro',
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
      numeroDocumento: [this.element.numeroDocumento, [AlcanosValidators.maxLength(90), AlcanosValidators.numerico]],
      primerNombre: [this.element.primerNombre, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],
      primerApellido: [this.element.primerApellido, [AlcanosValidators.maxLength(120), AlcanosValidators.alfabetico]],

    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

  }

  get numeroDocumento(): AbstractControl {
    return this.form.get('numeroDocumento');
  }
  get primerNombre(): AbstractControl {
    return this.form.get('primerNombre');
  }
  get primerApellido(): AbstractControl {
    return this.form.get('primerApellido');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/vacaciones/libro'],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/vacaciones/libro'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
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
