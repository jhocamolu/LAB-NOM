import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EditarService } from '../editar/editar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'dependencias-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  dependenciaOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
  ) {

    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [this.element.codigo, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(10)]],
      nombre: [this.element.nombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      dependenciaPadreId: [this.element.dependenciaPadreId],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectPadres();
  }

  public selectPadres(): void {
    this._service.getPadresLista().then(
      (resp: any[]) => {
        this.dependenciaOptions = resp;
      }
    );
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get dependenciaPadreId(): AbstractControl {
    return this.form.get('dependenciaPadreId');
  }


  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/dependencias'],
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
      ['/configuracion/dependencias'],
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
