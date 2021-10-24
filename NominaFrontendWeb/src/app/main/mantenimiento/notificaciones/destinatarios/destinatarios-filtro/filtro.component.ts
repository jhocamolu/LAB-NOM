import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarEditarService } from '../destinatario-listar/listar-editar.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'notificaciones-destinatario-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroEditarComponent implements OnInit {

  form: FormGroup;
  centroCostos: any[] = [];
  tipoDocumento: any;

  constructor(
    public dialogRef: MatDialogRef<FiltroEditarComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarEditarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      tipoDocumentoId: [this.element.tipoDocumentoId, []],
      numeroDocumento: [this.element.numeroDocumento, []],
      primerNombre: [this.element.primerNombre, []],
      primerApellido: [this.element.primerApellido, []],
      tipoDocumentos: [this.element.tipoDocumentos, []],
      estado: [this.element.estado, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    this._service.getTipoDocumentosList().then(resp => {
      this.tipoDocumento = resp; 
    });

  }

  get tipoDocumentoId(): AbstractControl {
    return this.form.get('tipoDocumentoId');
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
  get tipoDocumentos(): AbstractControl {
    return this.form.get('tipoDocumentos');
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
