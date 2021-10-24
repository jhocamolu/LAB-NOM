import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
  selector: 'paises-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  tipoAdministradora: any;

  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {
    this.form = this._formBuilder.group({
      codigo: [element.codigo, []],
      nombre: [element.nombre, [Validators.required, AlcanosValidators.maxLength(200)]],
      nit: [element.nit, [Validators.required, AlcanosValidators.maxLength(15), AlcanosValidators.numerico]],
      dv: [element.dv, [Validators.required, Validators.max(9), AlcanosValidators.numerico]],
      tipoAdministradoraId: [element.tipoAdministradoraId, [Validators.required]],
    }, { validator: this.validateDatosBasicos });
    this.submit = false;
    this.form.get('codigo').disable();
  }

  ngOnInit(): void {
    this._service.getTipoAdministradoras().then((resp) => {
      this.tipoAdministradora = resp;
    });
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateDatosBasicos(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;
    if (value.nit != null && value.dv != null) {
      let vpri, x, y, z;
      // Procedimiento
      vpri = new Array(16);
      z = `${value.nit}`.length;
      vpri[1] = 3;
      vpri[2] = 7;
      vpri[3] = 13;
      vpri[4] = 17;
      vpri[5] = 19;
      vpri[6] = 23;
      vpri[7] = 29;
      vpri[8] = 37;
      vpri[9] = 41;
      vpri[10] = 43;
      vpri[11] = 47;
      vpri[12] = 53;
      vpri[13] = 59;
      vpri[14] = 67;
      vpri[15] = 71;
      x = 0;
      y = 0;
      for (let i = 0; i < z; i++) {
        y = (`${value.nit}`.substr(i, 1));
        x += (y * vpri[z - i]);
      }
      y = x % 11;
      const dv = (y > 1) ? 11 - y : y;
      if (!(!isNaN(dv) && dv == value.dv)) {
        const errors = Object.assign({}, formGroup.get('dv').errors);
        errors[`El DV es incorrecto.`] = true;
        formGroup.get('dv').setErrors(errors);
      }
      if ((!isNaN(dv) && dv == value.dv)) {
        formGroup.get('dv').setErrors(null);
      }
    }
    return null;
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.codigo = this.element.codigo;
    formValue.id = this.element.id; 
    this._service.editar(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(resp);
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
          if ('codigo' in error.errors) {
            const errors = {};
            error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('codigo').setErrors(errors);
          }

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }

          if ('nit' in error.errors) {
            const errors = {};
            error.errors.nit.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nit').setErrors(errors);
          }

          if ('dv' in error.errors) {
            const errors = {};
            error.errors.dv.forEach(element => {
              errors[element] = true;
            });
            this.form.get('dv').setErrors(errors);
          }

          if ('tipoAdministradoraId' in error.errors) {
            const errors = {};
            error.errors.tipoAdministradoraId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoAdministradoraId').setErrors(errors);
          }
        }
      });
  }
}
