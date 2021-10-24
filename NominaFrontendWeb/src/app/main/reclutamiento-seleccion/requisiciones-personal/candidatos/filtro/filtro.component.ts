import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { CandidatosListarService } from '../listar/listar.service';
import { estadoCandidatosAlcanos } from '@alcanos/constantes/estado-candidatos';

@Component({
  selector: 'requisiciones-candidatos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CandidatosFiltroComponent implements OnInit {

  estadocandidato = estadoCandidatosAlcanos;

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CandidatosFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: CandidatosListarService,
  ) { 
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      numeroDocumento: [this.element.numeroDocumento, []],
      primerNombre: [this.element.primerNombre, []],
      segundoNombre: [this.element.segundoNombre, []],
      primerApellido: [this.element.primerApellido, []],
      segundoApellido: [this.element.segundoApellido, []],
      estado: [this.element.estado]
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
  get segundoNombre(): AbstractControl {
    return this.form.get('segundoNombre');
  }
  get primerApellido(): AbstractControl {
    return this.form.get('primerApellido');
  }
  get segundoApellido(): AbstractControl {
    return this.form.get('segundoApellido');
  }
  get estado(): AbstractControl {
    return this.form.get('estado');
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
