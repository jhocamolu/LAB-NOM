import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AlcanosValidators } from '@alcanos/utils';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'administradora-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  tipoAdministradora: any; 

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [element.codigo, [AlcanosValidators.maxLength(10)]],
      nombre: [element.nombre, [AlcanosValidators.maxLength(200)]],
      nit: [element.nit, [AlcanosValidators.maxLength(15), AlcanosValidators.numerico]],
      tipoAdministradoraId: [element.tipoAdministradoraId, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this._service.getTipoAdministradoras().then((resp) => {
      this.tipoAdministradora = resp;
    });
  }

  

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get nit(): AbstractControl {
    return this.form.get('nit');
  }

  get tipoAdministradoraId(): AbstractControl {
    return this.form.get('tipoAdministradoraId');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/administradoras'],
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
    this._router.navigate(
      ['/configuracion/administradoras'],
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
}
