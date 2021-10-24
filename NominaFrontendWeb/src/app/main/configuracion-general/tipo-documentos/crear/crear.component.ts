import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-documentos-crear',
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
      codigoPila: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(2)]],
      codigoDian: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(99)]],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(150)]],
      equivalenteBancario: [null, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(2)]],
      formato: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get codigoPila(): AbstractControl {
    return this.form.get('codigoPila');
  }

  get codigoDian(): AbstractControl {
    return this.form.get('codigoDian');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get equivalenteBancario(): AbstractControl {
    return this.form.get('equivalenteBancario');
  }
  
  get formato(): AbstractControl {
    return this.form.get('formato');
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
          if ('codigoPila' in error.errors) {
            const errors = {};
            error.errors.codigoPila.forEach(element => {
              errors[element] = true;
            });
            this.codigoPila.setErrors(errors);
          }

          if ('codigoDian' in error.errors) {
            const errors = {};
            error.errors.codigoDian.forEach(element => {
              errors[element] = true;
            });
            this.codigoDian.setErrors(errors);
          }

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }
          if ('formato' in error.errors) {
            const errors = {};
            error.errors.formato.forEach(element => {
              errors[element] = true;
            });
            this.formato.setErrors(errors);
          }
        }
      });
  }
}
