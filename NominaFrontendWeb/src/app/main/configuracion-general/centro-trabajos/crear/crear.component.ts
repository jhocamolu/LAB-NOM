import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'centro-trabajos-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: CrearService
  ) {

    this.form = this._formBuilder.group({
      codigo: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(9)]],
      nombre: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
      porcentajeRiesgo: [null, [Validators.required, AlcanosValidators.decimal, Validators.max(100)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get porcentajeRiesgo(): AbstractControl {
    return this.form.get('porcentajeRiesgo');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('codigo' in error.errors) {
            const errors = {};
            error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.codigo.setErrors(errors);
          }

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('porcentajeRiesgo' in error.errors) {
            const errors = {};
            error.errors.porcentajeRiesgo.forEach(element => {
              errors[element] = true;
            });
            this.porcentajeRiesgo.setErrors(errors);
          }
        }
      });

  }

}
