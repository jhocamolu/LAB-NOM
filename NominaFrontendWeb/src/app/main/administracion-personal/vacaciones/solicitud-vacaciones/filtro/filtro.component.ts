import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { estadoVacacionesAlcanos } from '@alcanos/constantes/estado-vacaciones';


@Component({
  selector: 'solicitud-vacaciones-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  estadoVacaciones = estadoVacacionesAlcanos;

  form: FormGroup;

  tipoAusentismos: any;
  claseDevengo: any;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: ListarService
  ) {
    this.element = this.element === null ? {} : this.element;

    this.form = this._formBuilder.group({
      criterioBusqueda: [this.element.criterioBusqueda],
      fechaInicioDisfrute: [(this.element.fechaInicioDisfrute) ? moment(this.element.fechaInicioDisfrute).format('YYYY-MM-DD') : null, []],
      fechaFinDisfrute: [(this.element.fechaFinDisfrute) ? moment(this.element.fechaFinDisfrute).format('YYYY-MM-DD') : null, []],
      estado: [this.element.estado],
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

  get primerApellido(): AbstractControl {
    return this.form.get('primerApellido');
  }

  get fechaInicioDisfrute(): AbstractControl {
    return this.form.get('fechaInicioDisfrute');
  }

  get fechaFinDisfrute(): AbstractControl {
    return this.form.get('fechaFinDisfrute');
  }

  get estado(): AbstractControl {
    return this.form.get('estado');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/vacaciones/solicitudes/'],
      {
        queryParams: {
          $filter: true,
        },
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const formValue = this.form.value;
    formValue.fechaInicioDisfrute = formValue.fechaInicioDisfrute  ?  moment(formValue.fechaInicioDisfrute).format('YYYY-MM-DD') : null;
    formValue.fechaFinDisfrute = formValue.fechaFinDisfrute  ?  moment(formValue.fechaFinDisfrute).format('YYYY-MM-DD') : null;  

    this._router.navigate(
      ['/vacaciones/solicitudes/'],
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
