import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'nivel-educativos-crear',
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
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService
  ) {

    this.form = this._formBuilder.group({
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(60)]],
      orden: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1), Validators.max(99)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get orden(): AbstractControl {
    return this.form.get('orden');
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
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {

          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('orden' in resp.error.errors) {
            const errors = {};
            resp.error.errors.orden.forEach(element => {
              errors[element] = true;
            });
            this.orden.setErrors(errors);
          }
        }
      });
  }
}
