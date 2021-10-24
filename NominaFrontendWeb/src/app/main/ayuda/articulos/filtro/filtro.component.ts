import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'ayuda-articulo-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  articuloOptions: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarService,
  ) {

    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      titulo: [this.element.titulo, [AlcanosValidators.maxLength(255)]],
      orden: [this.element.orden, [AlcanosValidators.maxLength(4), AlcanosValidators.numerico]],
      categoriaId: [this.element.categoriaId, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectDatos();
  }

  get titulo(): AbstractControl {
    return this.form.get('titulo');
  }

  get orden(): AbstractControl {
    return this.form.get('orden');
  }

  get categoriaId(): AbstractControl {
    return this.form.get('categoriaId');
  }

  public selectDatos(): void {
    this._service.getCategorias().then(
      (resp: any[]) => {
        this.articuloOptions = resp;
      }
    );
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/ayuda/articulos'],
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
      ['/ayuda/articulos'],
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
