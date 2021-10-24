import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { CrearConceptoService } from './crear-concepto.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'liquidaciones-crear-concepto',
  templateUrl: './crear-concepto.component.html',
  styleUrls: ['./crear-concepto.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearConceptoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  conceptoNominaOptions: any[];
  tipoContratoOptions: any[];
  subperiodoOptions: any[];

  constructor(
    public dialogRef: MatDialogRef<CrearConceptoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearConceptoService
  ) {
    this.submit = false;
    this.form = this._formBuilder.group({
      conceptoNominaId: [null],
      tipoContratoId: [null],
      subperiodoId: [null],
    });
  }

  ngOnInit(): void {
    this.selectConceptoNomina();
    this.selectTipoContrato();
    this.selectSubperiodo(this.element.tipoPeriodoId);
  }

  public selectConceptoNomina(): void {
    this.conceptoNominaOptions = [];
    this._service.getConceptoNominaLista().then(
      (resp: any[]) => {
        this.conceptoNominaOptions = resp;
      }
    );
  }

  public selectTipoContrato(): void {
    this.tipoContratoOptions = [];
    this._service.getTipoContratoLista().then(
      (resp: any[]) => {
        this.tipoContratoOptions = resp;
      }
    );
  }

  public selectSubperiodo(tipoPeriodoId: number): void {
    this.subperiodoOptions = [];
    this._service.getSubperiodoLista(tipoPeriodoId).then(
      (resp: any[]) => {
        this.subperiodoOptions = resp;
      }
    );
  }

  get conceptoNominaId(): AbstractControl {
    return this.form.get('conceptoNominaId');
  }

  get tipoContratoId(): AbstractControl {
    return this.form.get('tipoContratoId');
  }

  get subperiodoId(): AbstractControl {
    return this.form.get('subperiodoId');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.tipoliquidacionId = this.element.id;
    this._service.crear(formValue).then((resp) => {
      this.dialogRef.close(true);
    }
    ).catch((resp: HttpErrorResponse) => {

      this._alcanosSnackBar.snackbar({
        clase: 'error',
        mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
      });

     
      this.submit = false;
      let error = resp.error;
      if (typeof resp.error === 'string') {
        error = JSON.parse(resp.error);
      } else {
        error = resp.error;
      }
      if (resp.status === 400 && 'errors' in error) {
        if ('conceptoNominaId' in error.errors) {
          const errors = {};
          error.errors.conceptoNominaId.forEach(element => {
            errors['Error'] = true;
          });
          this.conceptoNominaId.setErrors(errors);
        }
        if ('tipoContratoId' in error.errors) {
          const errors = {};
          error.errors.tipoContratoId.forEach(element => {
            errors[element] = true;
          });
          this.tipoContratoId.setErrors(errors);
        }
        if ('subperiodoId' in error.errors) {
          const errors = {};
          error.errors.subperiodoId.forEach(element => {
            errors[element] = true;
          });
          this.subperiodoId.setErrors(errors);
        }

        if ('snack' in error.errors) {
          let msg = '';
          error.errors.snack.forEach(element => {
            msg = element;
          });
          this._alcanosSnackBar.snackbar({
            clase: 'error',
            mensaje: msg,
            time: 7000,
          });
        }
      }
      
    });
  }

}
