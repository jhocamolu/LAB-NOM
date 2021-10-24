import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FiltroService } from './filtro.service';

@Component({
  selector: 'plantilla-documentos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  grupos: any[];

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: FiltroService,
  ) {
    this.grupos = [];
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      nombre: [this.element.nombre, [Validators.pattern('^[A-Za-z\\sÁÉÍÓÚÑñ]*$'), Validators.maxLength(30)]],
      grupoDocumentoId: [this.element.grupoDocumentoId]
    });
  }

  ngOnInit(): void {
    this._service.getGrupos().then(resp => this.grupos = resp.sort(function (a, b) {
      if (a.nombre < b.nombre) { return -1; }
      if (a.nombre > b.nombre) { return 1; }
      return 0;
    }));
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get grupoDocumentoId(): AbstractControl {
    return this.form.get('grupoDocumentoId');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/plantilla/documentos'],
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
      ['/plantilla/documentos'],
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
