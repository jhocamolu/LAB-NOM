import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarEditarService } from '../listar-editar/listar-editar.service';
import { CrearConceptoService } from '../crear-concepto/crear-concepto.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-liquidacion-filtro-concepto',
  templateUrl: './filtro-concepto.component.html',
  styleUrls: ['./filtro-concepto.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroConceptoComponent implements OnInit {

  form: FormGroup;
  tipoContratoOptions: any[];
  subperiodoOptions: any[];

  constructor(
    public dialogRef: MatDialogRef<FiltroConceptoComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarEditarService,
    private _service2: CrearConceptoService
  ) { 
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [this.element.codigo, [ AlcanosValidators.maxLength(20)]],
      nombre: [this.element.nombre, [ AlcanosValidators.maxLength(60)]],
      subperiodo: [this.element.subperiodo ? parseInt(this.element.subperiodo, 10) : null, []],
      tipoContrato: [this.element.tipoContrato ? parseInt(this.element.tipoContrato, 10) : null],
    });
  }

  ngOnInit(): void {
    this.selectTipoContrato();
    this.selectSubperiodo();
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

  }

  public selectTipoContrato(): void {
    this.tipoContratoOptions = [];
    this._service2.getTipoContratoLista().then(
      (resp: any[]) => {
        this.tipoContratoOptions = resp;
      }
    );
  }

  public selectSubperiodo(): void {
    this.subperiodoOptions = [];
    this._service2.getSubperiodoFiltro().then(
      (resp: any[]) => {
        this.subperiodoOptions = resp;
      }
    );
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }
  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get subperiodo(): AbstractControl {
    return this.form.get('subperiodo');
  }
  get tipoContrato(): AbstractControl {
    return this.form.get('tipoContrato');
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
    };
    this._service.buildFilter(queryParams);
    this.dialogRef.close(formValue);
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

}
