import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';


@Component({
  selector: 'centro-trabajos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
  ) {

    this.form = this._formBuilder.group({
      id: [element.id],
      codigo: { value: element.codigo, disabled: true },
      nombre: [element.nombre, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
      porcentajeRiesgo: [element.porcentajeRiesgo, [Validators.required, AlcanosValidators.decimal, Validators.max(100)]],
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
    formValue.codigo = this.element.codigo;
    this._service.editar(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(resp);
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
