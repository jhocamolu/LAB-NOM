import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'liquidaciones-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  tipoPeriodosOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: ListarService,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [this.element.codigo, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(20)]],
      nombre: [this.element.nombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(60)]],
      tipoPeriodoId: [this.element.tipoPeriodoId],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectTipoPeriodo();

  }
  public selectTipoPeriodo(): void {
    this._service.getTipoPeriodoLista().then(
      (resp: any[]) => {
        this.tipoPeriodosOptions = resp;
      }
    );
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }
  get tipoPeriodoId(): AbstractControl {
    return this.form.get('tipoPeriodoId');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/nomina/tipo-liquidaciones'],
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
      ['/nomina/tipo-liquidaciones'],
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

