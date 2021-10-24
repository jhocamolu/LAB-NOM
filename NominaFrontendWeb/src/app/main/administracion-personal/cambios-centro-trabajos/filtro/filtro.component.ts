import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'categoria-novedades-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      funcionario: [this.element.funcionario, [AlcanosValidators.maxLength(60)]],
      fechaInicio: [this.element.fechaInicio, []],
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
  }


  limpiarHandle(event): void {
    this._router.navigate(
      ['/administracion-personal/cambio-centro-trabajos'],
      {
        queryParams: {
          $filter: true,
        },
        queryParamsHandling: 'merge',
      });
    this.dialogRef.close({});
  }

  buscarHandle(event): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate(
      ['/administracion-personal/cambio-centro-trabajos'],
      {
        queryParams: {
          $filter: toUrlEncoded(this.form.value),
          $top: 5,
          $skip: 0,
        },
      });
    this.dialogRef.close(this.form.value);

  }

}
