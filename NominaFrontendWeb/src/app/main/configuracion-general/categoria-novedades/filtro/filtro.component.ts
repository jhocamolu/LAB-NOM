import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';
import { modulosCategoriaNovedades } from '@alcanos/constantes/categoria-novedades';

@Component({
  selector: 'categoria-novedades-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {
  form: FormGroup;

  modulos = modulosCategoriaNovedades;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      nombre: [this.element.nombre, [AlcanosValidators.maxLength(60)]],
      modulo: [this.element.modulo, []],
      clase: [this.element.clase, []],
      requiereTercero: [this.element.requiereTercero],
      valorEditable: [this.element.valorEditable],
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
      ['/configuracion/categoria-novedades'],
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
    this._router.navigate(
      ['/configuracion/categoria-novedades'],
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
