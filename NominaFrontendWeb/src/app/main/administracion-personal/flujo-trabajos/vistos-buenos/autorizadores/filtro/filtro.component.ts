import { Component, OnInit, Optional, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AutorizadoresListarService } from '../listar/listar.service';

@Component({
  selector: 'autorizadores-aprobadores-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AutorizadoresFiltroComponent implements OnInit {

  form: FormGroup;

  dependenciaCargoOptions: any[] = [];
  centroOperativoOptions: any[] = [];
  cargoOptions: any[] = [];



  constructor(
    public dialogRef: MatDialogRef<AutorizadoresFiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: AutorizadoresListarService
  ) {
    this._service.getDependenciaCargosList();
    this._service.getCentroOperativosList();
    this._service.getCargosList();
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      dependenciaId: [this.element.dependenciaId ? parseInt(this.element.dependenciaId, 10) : null, []],
      cargoIndependienteId: [this.element.cargoIndependienteId ? parseInt(this.element.cargoIndependienteId, 10) : null, []],
      centroOperativoIndependienteId: [ this.element.centroOperativoIndependienteId  ?parseInt(this.element.centroOperativoIndependienteId, 10) : null, []],
    });
  }


  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this._service.onDependenciaCargosChange.subscribe((resp) => {
      this.dependenciaCargoOptions = resp;
    });

    this._service.onCargosChange.subscribe((resp) => {
      this.cargoOptions = resp;
    });

    this._service.onCentroOperativosChange.subscribe((resp) => {
      this.centroOperativoOptions = resp;
    });
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
