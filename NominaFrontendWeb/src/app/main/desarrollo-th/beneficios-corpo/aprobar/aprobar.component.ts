import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AprobarService } from './aprobar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';
import { Router } from '@angular/router';


@Component({
  selector: 'beneficios-aprobar',
  templateUrl: './aprobar.component.html',
  styleUrls: ['./aprobar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class AprobarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  estadoSolicitud = estadoBeneficiosAlcanos;

  constructor(
    public dialogRef: MatDialogRef<AprobarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: AprobarService,
    private _router: Router,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      aprobacion: [null, [Validators.required]],
      observacionAprobacion: [null, [Validators.required]],
    }, { validators: this.validateBeneficios });

  }

  ngOnInit(): void {
  }

  get observacionAprobacion(): AbstractControl {
    return this.form.get('observacionAprobacion');
  }

  get aprobacion(): AbstractControl {
    return this.form.get('aprobacion');
  }


  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }


  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.estado = formValue.aprobacion ? estadoBeneficiosAlcanos.aprobada : estadoBeneficiosAlcanos.rechazada;
    formValue.observacionAprobacion = formValue.observacionAprobacion;

    formValue.id = this.element.id;
    formValue.tipoBeneficioId = this.element.tipoBeneficioId;
    formValue.tipoPeriodoId = this.element.tipoPeriodoId;


    this._service.estado(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        //this._router.navigate([`/desarrollo-th/beneficios`]);
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

          if ('observacionAprobacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observacionAprobacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacionAprobacion').setErrors(errors);
          }

          if ('aprobacion' in error.errors) {
            const errores = {};
            error.errors.aprobacion.forEach(element => {
              errores[element] = true;
            });
            this.aprobacion.setErrors(errores);
          }

        }
      });
  }

  /**
   *
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateBeneficios(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;
    if (value.aprobacion != null) {
      if (!value.aprobacion && !value.observacionAprobacion) {
        formGroup.get('observacionAprobacion').setErrors({ 'required': true });
      } else {
        formGroup.get('observacionAprobacion').markAllAsTouched();
        formGroup.get('observacionAprobacion').setErrors(null);
      }
    }
    return null;
  }

}
