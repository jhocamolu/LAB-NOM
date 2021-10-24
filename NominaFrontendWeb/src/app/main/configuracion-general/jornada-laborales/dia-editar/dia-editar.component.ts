import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import { DiaService } from './dia-editar.service';


@Component({
  selector: 'jornada-laboral-dias-editar',
  templateUrl: './dia-editar.component.html',
  styleUrls: ['./dia-editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiaEditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  idDia: number;
  id: number;

  constructor(
    public dialogRef: MatDialogRef<DiaEditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _service: DiaService
  ) {
    this.form = this._formBuilder.group({
      id: [this.element.id],
      dia: [this.element.dia, [Validators.required]],
      horaInicioJornada: [(this.element.horaInicioJornada) ? moment(`2000-01-01 ${this.element.horaInicioJornada}`).format('HH:mm:ss') : null, [Validators.required]],
      horaInicioDescanso: [(this.element.horaInicioDescanso) ? moment(`2000-01-01 ${this.element.horaInicioDescanso}`).format('HH:mm:ss') : null, []],
      horaFinDescanso: [(this.element.horaFinDescanso) ? moment(`2000-01-01 ${this.element.horaFinDescanso}`).format('HH:mm:ss') : null, []],
      horaFinJornada: [(this.element.horaFinJornada) ? moment(`2000-01-01 ${this.element.horaFinJornada}`).format('HH:mm:ss') : null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;

  }

  ngOnInit(): void { }


  compareFn(c1: any, c2: any): boolean {
    return (c1 && c2 ? c1.trim() === c2.trim() : c1 === c2);
  }

  get dia(): AbstractControl {
    return this.form.get('dia');
  }

  get horaInicioJornada(): AbstractControl {
    return this.form.get('horaInicioJornada');
  }

  get horaInicioDescanso(): AbstractControl {
    return this.form.get('horaInicioDescanso');
  }

  get horaFinDescanso(): AbstractControl {
    return this.form.get('horaFinDescanso');
  }

  get horaFinJornada(): AbstractControl {
    return this.form.get('horaFinJornada');
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

    if (value.horaInicioJornada != null && value.horaFinJornada != null) {
      formGroup.get('horaFinJornada').setErrors(null);
      // validacion de la hora
      const fechaInicioJornada = moment(moment().format(`YYYY-MM-DD ${value.horaInicioJornada}`)).toDate();
      const fechaFinJornada = moment(moment().format(`YYYY-MM-DD ${value.horaFinJornada}`)).toDate();
      if (fechaFinJornada.getTime() <= fechaInicioJornada.getTime()) {
        const errors = {};
        errors['La hora fin jornada que ingresaste no debe ser menor que la hora inicio de jornada.'] = true;
        formGroup.get('horaFinJornada').setErrors(errors);

      }
    }

    if (value.horaInicioJornada != null && value.horaInicioDescanso != null) {
      formGroup.get('horaInicioDescanso').setErrors(null);
      // validacion de la hora
      const fechaInicio = moment(moment().format(`YYYY-MM-DD ${value.horaInicioJornada}`)).toDate();
      const fechaFin = moment(moment().format(`YYYY-MM-DD ${value.horaInicioDescanso}`)).toDate();
      if (fechaFin.getTime() <= fechaInicio.getTime()) {
        const errors = {};
        errors['La hora que ingresaste no debe ser menor a la hora anterior.'] = true;
        formGroup.get('horaInicioDescanso').setErrors(errors);
      }
    }

    if (value.horaInicioDescanso != null && value.horaFinDescanso != null) {
      formGroup.get('horaFinDescanso').setErrors(null);
      // validacion de la hora
      const fechaInicio = moment(moment().format(`YYYY-MM-DD ${value.horaInicioDescanso}`)).toDate();
      const fechaFin = moment(moment().format(`YYYY-MM-DD ${value.horaFinDescanso}`)).toDate();
      if (fechaFin.getTime() <= fechaInicio.getTime()) {
        const errors = {};
        errors['La hora que ingresaste no debe ser menor a la hora anterior.'] = true;
        formGroup.get('horaFinDescanso').setErrors(errors);

      }
    }


    if (value.horaFinDescanso != null && value.horaFinJornada != null) {
      formGroup.get('horaFinJornada').setErrors(null);
      // validacion de la hora
      const fechaInicio = moment(moment().format(`YYYY-MM-DD ${value.horaFinDescanso}`)).toDate();
      const fechaFin = moment(moment().format(`YYYY-MM-DD ${value.horaFinJornada}`)).toDate();
      if (fechaFin.getTime() <= fechaInicio.getTime()) {
        const errors = {};
        errors['La hora que ingresaste no debe ser menor a la hora anterior.'] = true;
        formGroup.get('horaFinJornada').setErrors(errors);

      }
    }


    return null;
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.jornadaLaboralId = this.element.jornadaLaboralId;
    this._service.editar(formValue.id, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
      }).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('dia' in error.errors) {
            const errores = {};
            error.errors.dia.forEach(element => {
              errores[element] = true;
            });
            this.dia.setErrors(errores);
          }
          if ('horaInicioJornada' in error.errors) {
            const errores = {};
            error.errors.horaInicioJornada.forEach(element => {
              errores[element] = true;
            });
            this.horaInicioJornada.setErrors(errores);
          }
          if ('horaInicioDescanso' in error.errors) {
            const errores = {};
            error.errors.horaInicioDescanso.forEach(element => {
              errores[element] = true;
            });
            this.horaInicioDescanso.setErrors(errores);
          }
          if ('horaFinDescanso' in error.errors) {
            const errores = {};
            error.errors.horaFinDescanso.forEach(element => {
              errores[element] = true;
            });
            this.horaFinDescanso.setErrors(errores);
          }
          if ('horaFinJornada' in error.errors) {
            const errores = {};
            error.errors.horaFinJornada.forEach(element => {
              errores[element] = true;
            });
            this.horaFinJornada.setErrors(errores);
          }
        }
      });
  }

}
