import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { CrearEstadoService } from './crear-estado.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'tipo-liquidaciones-crear-estado',
  templateUrl: './crear-estado.component.html',
  styleUrls: ['./crear-estado.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearEstadoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<CrearEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matSnackBar: MatSnackBar,
    private _service: CrearEstadoService
  ) {
    this.submit = false;

    this.form = this._formBuilder.group({

      estadofuncionario: [null, [Validators.required]],
      estadoContrato: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
  }

  get estadofuncionario(): AbstractControl {
    return this.form.get('estadofuncionario');
  }

  get estadoContrato(): AbstractControl {
    return this.form.get('estadoContrato');
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
        if ('estadofuncionario' in error.errors) {
          const errors = {};
          error.errors.estadofuncionario.forEach(element => {
            errors[element] = true;
          });
          this.estadofuncionario.setErrors(errors);
        }
        if ('estadoContrato' in error.errors) {
          const errors = {};
          error.errors.estadoContrato.forEach(element => {
            errors[element] = true;
          });
          this.estadoContrato.setErrors(errors);
        }
        if ('snack' in error.errors) {
          let msg = '';
          error.errors.snack.forEach(element => {
            msg = element;
          });
          this._alcanosSnackBar.snackbar({
            clase: 'error',
            mensaje: msg,
            time: 6000,
          });
        }
      }
    });
  }
}
