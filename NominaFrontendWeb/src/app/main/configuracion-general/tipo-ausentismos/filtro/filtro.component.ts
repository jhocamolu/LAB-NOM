import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EditarService } from '../editar/editar.service';
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

  constructor(
    public dialogRef: MatDialogRef<FiltroComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
  ) { 
    this.element = this.element === null ? {} : this.element;
    this.form = this._formBuilder.group({
      nombre: [this.element.nombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      claseAusentismoId: [this.element.claseAusentismoId],
    });
  }

  ngOnInit(): void  {
    this.dialogRef.updatePosition({
      top: `0px`,
      right: `0px`
    });
    this.selectClase();
  }
  public selectClase(): void {
    this._service.getClaseLista().then(
      (resp: any[]) => {
        this.claseOptions = resp;
      }
    );
  }
  

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get claseAusentismoId(): AbstractControl {
    return this.form.get('claseAusentismoId');
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/tipo-ausentismos'],
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
      ['/configuracion/tipo-ausentismos'],
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
