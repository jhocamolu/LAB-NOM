import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AutorizarService } from './autorizar.service';
import { estadoVacacionesAlcanos } from '@alcanos/constantes/estado-vacaciones';

@Component({
  selector: 'solicitud-vacaciones-autorizar',
  templateUrl: './autorizar.component.html',
  styleUrls: ['./autorizar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AutorizarComponent implements OnInit {

  estadoVacaciones = estadoVacacionesAlcanos;

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<AutorizarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: AutorizarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, Validators.required],
      justificacion: [null],
    }, { validators: this.validate });
  }

  ngOnInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;
    if (value.estado === 'Rechazada' && !value.justificacion) {
      formGroup.get('justificacion').setErrors({ 'required': true });
    } else {
      formGroup.get('justificacion').setErrors(null);
    }
    formGroup.get('justificacion').markAllAsTouched();
    return null;
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.estado(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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
          if ('estado' in resp.error.errors) {
            const errors = {};
            resp.error.errors.estado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }
          if ('justificacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.justificacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('justificacion').setErrors(errors);
          }
          
          if ('snackbar' in error.errors) {
            const errors = {};
            error.errors.snackbar.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 6000
              });
            });
          }
        }
      });
  }
}
