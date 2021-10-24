import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CuentasListarService } from '../listar/listar.service';

@Component({
  selector: 'concepto-nominas-cuentas-formulario',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CuentasFiltroComponent implements OnInit {

  form: FormGroup;
  centroCostos: any[] = [];


  constructor(
    public dialogRef: MatDialogRef<CuentasFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: CuentasListarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      centroCostoId: [this.element.centroCostoId, []],
      codigo: [this.element.codigo, []],
      cuentaContableId: [this.element.cuentaContableId, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this._service.getCentroCostos().then((resp) => {
      this.centroCostos = resp.value;
    });
  }

  get centroCostoId(): AbstractControl {
    return this.form.get('centroCostoId');
  }
  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }
  get cuentaContableId(): AbstractControl {
    return this.form.get('cuentaContableId');
  }

  limpiarHandle(event): void {
    const queryParams = {
      $filter: 'true',
    };
    this._service.buildFilter(queryParams);
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const formValue = this.form.value;

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const queryParams = {
      $filter: toUrlEncoded(formValue),
      $top: 5,
      $skip: 0,
    };
    this._service.buildFilter(queryParams);
    this.dialogRef.close(formValue);
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

}
