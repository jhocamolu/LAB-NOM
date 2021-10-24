import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { SubperiodoFormService } from './subperiodo-form.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-periodos-subperiodo-form',
  templateUrl: './subperiodo-form.component.html',
  styleUrls: ['./subperiodo-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SubperiodoFormComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  accion: any;

  data: number;

  constructor(
    public dialogRef: MatDialogRef<SubperiodoFormComponent>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _matSnackBar: MatSnackBar,
    private _service: SubperiodoFormService
  ) {
    this.accion = element.accion;
    this.submit = false;

    this.form = this._formBuilder.group({
      id: [null],
      tipoPeriodoId: [null],
      nombre: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(100)]],
      dias: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(1000)]],
      diaInicial: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(31)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    if (this.accion === 'crear') {
      this.form.patchValue({
        tipoPeriodoId: this.element.element,

      });
    }
    if (this.accion === 'editar') {

      this.form.patchValue({
        id: this.element.element.id,
        tipoPeriodoId: this.element.element.tipoPeriodoId,
        nombre: this.element.element.nombre,
        dias: this.element.element.dias,
        diaInicial: this.element.element.diaInicial,

      });
      this.form.markAllAsTouched();
    }
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get dias(): AbstractControl {
    return this.form.get('dias');
  }

  get diaInicial(): AbstractControl {
    return this.form.get('diaInicial');
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.upsert(formValue, this.accion)
      .then((resp) => {
        this.dialogRef.close(true);
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
      }
      ).catch((resp: HttpErrorResponse) => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }

        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            this.nombre.setErrors(errores);
          }

          if ('dias' in error.errors) {
            const errores = {};
            error.errors.dias.forEach(element => {
              errores[element] = true;
            });
            this.dias.setErrors(errores);
          }
          if ('diaInicial' in error.errors) {
            const errores = {};
            error.errors.diaInicial.forEach(element => {
              errores[element] = true;
            });
            this.diaInicial.setErrors(errores);
          }
        }
        this._matSnackBar.open(mensaje, 'Aceptar', {
          verticalPosition: 'top',
          duration: 9000,
          panelClass: ['error-snackbar'],
        });
      });

  }

}
