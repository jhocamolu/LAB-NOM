import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FormularioService } from '../formulario/formulario.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-ausentismos-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

  form: FormGroup;
  claseOptions: any[] = [];
  tipoAdministradoras: any; 

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: FormularioService,
  ) { 
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      funcionario: [this.element.funcionario, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(100)]],
      tipoAdministradora: [this.element.tipoAdministradora, []],
    });
  }

  ngOnInit(): void  {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this._service.getTipoAdministradoras().then(resp => {
      this.tipoAdministradoras = resp; 
    });
    this.selectClase();
  }
  public selectClase(): void { }
  
  limpiarHandle(event): void {
    this._router.navigate(
      ['/administracion-personal/cambio-administradora'],
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
      ['/administracion-personal/cambio-administradora'],
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
