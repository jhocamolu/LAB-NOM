import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EditarService } from '../editar/editar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-contratos-filtro',
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
      nombre: [this.element.nombre, [AlcanosValidators.alfabetico, Validators.maxLength(60)]],
      clase: [this.element.clase],
      cantidadProrrogas: [this.element.cantidadProrrogas, [AlcanosValidators.numerico, Validators.max(10)]],
      duracionMaxima: [this.element.duracionMaxima, [AlcanosValidators.numerico, Validators.max(99999)]],
      terminoIndefinido: [this.element.terminoIndefinido],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get clase(): AbstractControl {
    return this.form.get('clase');
  }

  get cantidadProrrogas(): AbstractControl {
    return this.form.get('cantidadProrrogas');
  }

  get duracionMaxima(): AbstractControl {
    return this.form.get('duracionMaxima');
  }

  get terminoIndefinido(): AbstractControl {
    return this.form.get('terminoIndefinido');
  }
  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/tipo-contratos'],
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
      ['/configuracion/tipo-contratos'],
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

