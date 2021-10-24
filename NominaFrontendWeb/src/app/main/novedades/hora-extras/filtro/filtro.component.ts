import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { EditarService } from '../editar/editar.service';
import { tipoHoraExtra, tipoHoraExtraMostrar } from '@alcanos/constantes/tipo-hora-extra';

@Component({
  selector: 'hora-extras-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  horaExtra = tipoHoraExtra;
  horaExtraM = tipoHoraExtraMostrar;

  form: FormGroup;
  tipoHoraExtraOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: EditarService
  ) {
    this.element = this.element === null ? {} : this.element;

    this.form = this._formBuilder.group({
      criterioBusqueda: [this.element.criterioBusqueda],
      fecha: [(this.element.fecha) ? moment(this.element.fecha).format('YYYY-MM-DD') : null, []],
      estado: [this.element.estado],
      tipoHoraExtraId: [this.element.tipoHoraExtraId, []],
      formaRegistro: [this.element.formaRegistro],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectConceptos();

  }
  public selectConceptos(): void {
    this._service.getHoraExtrasLista().then(
      (resp: any[]) => {
        this.tipoHoraExtraOptions = resp;
      }
    );
  }

  get fecha(): AbstractControl {
    return this.form.get('fecha');
  }

  get tipoHoraExtraId(): AbstractControl {
    return this.form.get('tipoHoraExtraId');
  }

  get estado(): AbstractControl {
    return this.form.get('estado');
  }

  get formaRegistro(): AbstractControl {
    return this.form.get('formaRegistro');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/novedades/hora-extras/'],
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
    formValue.fecha = formValue.fecha ? moment(formValue.fecha).format('YYYY-MM-DD') : null;

    this._router.navigate(
      ['/novedades/hora-extras/'],
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
