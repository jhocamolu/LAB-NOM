import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { TipoAplicacionExterna } from '@alcanos/constantes/aplicacion-externa';

@Component({
  selector: 'aprobaciones-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;

  tipoAplicacion = TipoAplicacionExterna;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      codigo: [this.element.codigo, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(3)]],
      nombre: [this.element.nombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      revisa: [this.element.revisa, []],
      aprueba: [this.element.aprueba, []],
      autoriza: [this.element.autoriza, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }
  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get revisa(): AbstractControl {
    return this.form.get('revisa');
  }
  get aprueba(): AbstractControl {
    return this.form.get('aprueba');
  }
  get autoriza(): AbstractControl {
    return this.form.get('autoriza');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/flujo-trabajos/vistos-buenos'],
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
      ['/flujo-trabajos/vistos-buenos'],
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
