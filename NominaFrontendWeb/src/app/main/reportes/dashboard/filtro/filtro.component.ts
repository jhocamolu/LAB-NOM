import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'paises-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  subCategorias: any[];
  reportes: any[]; 

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: ListarService
  ) {
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      categoria: [this.element.categoria, []],
      reporte: [this.element.reporte, []]
    });
  }

  ngOnInit(): void {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });

    if (this.element.categoria != null) {
      this._service.getReporte(this.element.categoria, this._service.alias).then((resp) => {
        this.reportes = resp;
      });
    }

    setTimeout(() => {
      if (this.element != null) {
        this.form.patchValue({
          reporte: this.element.reporte,
        });
      }
    }, 600);

    this.form.get('categoria').valueChanges.subscribe(
      (value) => {
        this.reportes = [];
        this.form.get('reporte').setValue(null);
        if (value != null) {
          this._reportes(value, this.reportes);
        }
      }
    );

    this._service.getSubcategoriaCategorias(this._service.alias).then(resp => {
      this.subCategorias = resp; 
    });
  }

  get categoria(): AbstractControl {
    return this.form.get('categoria');
  }

  get reporte(): AbstractControl {
    return this.form.get('reporte');
  }

  private _reportes(reportes, array: any[]): void {
    this._service.getReporte(reportes, this._service.alias).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  limpiarHandle(event): void {
    this._router.navigate(
      [`/reportes/${this._service.alias}/dashboard`],
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
      [`/reportes/${this._service.alias}/dashboard`],
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
}
