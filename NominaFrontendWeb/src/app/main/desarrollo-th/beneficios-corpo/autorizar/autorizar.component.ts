import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AutorizarService } from './autorizar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';
import { Router } from '@angular/router';

@Component({
  selector: 'beneficios-autorizar',
  templateUrl: './autorizar.component.html',
  styleUrls: ['./autorizar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AutorizarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  estadoSolicitud = estadoBeneficiosAlcanos;
  permiteValorAutorizado: boolean;
  valoresAutorizados: boolean;
  constructor(
    public dialogRef: MatDialogRef<AutorizarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: AutorizarService,
    private _router: Router,
  ) {
    this.valoresAutorizados = element.tipoBeneficio.valorAutorizado;


    this.form = this._formBuilder.group({
      id: [element.id],
      autorizacion: [null, [Validators.required]],
      valorAutorizado: [null, [Validators.required]],
      observacionAutorizacion: [null, [Validators.required]],
    }, { validators: this.validateBeneficios });

  }

  ngOnInit(): void {

    if (this.valoresAutorizados) {
      this.permiteValorAutorizado = true;
      this.form.get('valorAutorizado').setValidators([Validators.required]);
    } else {
      this.permiteValorAutorizado = false;
      this.form.get('valorAutorizado').clearValidators();
      this.form.get('valorAutorizado').setErrors(null);
    }

    this.form.get('autorizacion').valueChanges.subscribe(value => {
      if (this.valoresAutorizados) {
        if (!value) {
          this.permiteValorAutorizado = false;
          this.form.get('valorAutorizado').setErrors(null);
          this.form.get('valorAutorizado').clearValidators();
        } else {
          this.permiteValorAutorizado = true;
          this.form.get('valorAutorizado').setValue(null);
        }
      }
      if (!this.valoresAutorizados) {
        this.form.get('observacionAutorizacion').setValidators([Validators.required]);
      } 
    });

  }



  get autorizacion(): AbstractControl {
    return this.form.get('autorizacion');
  }

  get valorAutorizado(): AbstractControl {
    return this.form.get('valorAutorizado');
  }

  get observacionAutorizacion(): AbstractControl {
    return this.form.get('observacionAutorizacion');
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;

    formValue.estado = formValue.autorizacion ? estadoBeneficiosAlcanos.autorizada : estadoBeneficiosAlcanos.rechazada;
    formValue.observacionAutorizacion = formValue.observacionAutorizacion;
    formValue.valorAutorizado = formValue.valorAutorizado;

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
          if ('autorizacion' in error.errors) {
            const errors = {};
            error.errors.autorizacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('autorizacion').setErrors(errors);
          }
          if ('valorAutorizado' in error.errors) {
            const errors = {};
            error.errors.valorAutorizado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valorAutorizado').setErrors(errors);
          }

          if ('observacionAutorizacion' in error.errors) {
            const errors = {};
            error.errors.observacionAutorizacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacionAutorizacion').setErrors(errors);
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
    if (value.autorizacion != null) {
      if (value.autorizacion && !value.valorAutorizado) {
        // formGroup.get('valorAutorizado').setErrors({ 'required': true });
      } else {
        formGroup.get('valorAutorizado').markAllAsTouched();
        formGroup.get('valorAutorizado').setErrors(null);
      }
      if (!value.autorizacion && !value.observacionAutorizacion) {
        formGroup.get('observacionAutorizacion').setErrors({ 'required': true });
      } else {
        formGroup.get('observacionAutorizacion').markAllAsTouched();
        formGroup.get('observacionAutorizacion').setErrors(null);
      }
    }
    return null;
  }

}
