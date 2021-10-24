import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AprobarEstudioService } from './aprobar.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'funcionario-estudio-aprobar',
  templateUrl: './aprobar.component.html',
  styleUrls: ['./aprobar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AprobarEstudioComponent implements OnInit {

  form: FormGroup;
  submit: boolean;


  constructor(
    public dialogRef: MatDialogRef<AprobarEstudioComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: AprobarEstudioService,
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
    if (value.estado !== null) {
      if (!value.estado && !value.justificacion) {
        formGroup.get('justificacion').setErrors({ 'required': true });
      } else {
        formGroup.get('justificacion').markAllAsTouched();
        formGroup.get('justificacion').setErrors(null);
      }
    }
    return null;
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
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
        }
      });
  }


}
