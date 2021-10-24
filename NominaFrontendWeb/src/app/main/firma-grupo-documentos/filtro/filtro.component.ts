import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'firma-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  grupoDocumentosObtener: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _service: ListarService
  ) {
    
    this._service.getGrupoDocumentosList();
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
      grupoDocumentoSlug: [this.element.grupoDocumentoSlug],
      fechaInicio: [(this.element.fechaInicio) ? moment(this.element.fechaInicio).format('YYYY-MM-DD') : null, []],
      fechaFin: [(this.element.fechaFin) ? moment(this.element.fechaFin).format('YYYY-MM-DD') : null, []],
      // fechaFin: [ moment(this.element.fechaFin).format('YYYY-MM-DD') , null],

    }
    );
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this._service.onGrupoDocumentosChanged.subscribe(
      (resp: any[]) => {
      this.grupoDocumentosObtener = resp;
    });
  }

  get criterioBusqueda(): AbstractControl {
    return this.form.get('criterioBusqueda');
  }
  get grupoDocumentoSlug(): AbstractControl {
    return this.form.get('grupoDocumentoSlug');
  }
  get fechaInicio(): AbstractControl {
    return this.form.get('fechaInicio');
  }
  get fechaFin(): AbstractControl {
    return this.form.get('fechaFin');
  }


  limpiarHandle(event): void {
    this._router.navigate(
      ['/firma-grupo-documentos'],
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
    formValue.fechaInicio = formValue.fechaInicio  ?  moment(formValue.fechaInicio).format('YYYY-MM-DD') : null; 
    formValue.fechaFin = formValue.fechaFin  ?  moment(formValue.fechaFin).format('YYYY-MM-DD') : null;

    this._router.navigate(
      ['/firma-grupo-documentos'],
      {
        queryParams: {
          $filter: toUrlEncoded(formValue),
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
