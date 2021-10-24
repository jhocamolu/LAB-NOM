import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearService } from './crear.service';
import { tipoHoraExtra, tipoHoraExtraMostrar } from '@alcanos/constantes/tipo-hora-extra';

@Component({
  selector: 'hora-extras-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  horaExtra = tipoHoraExtra;
  horaExtraM = tipoHoraExtraMostrar;

  form: FormGroup;
  submit: boolean;
  item: any;
  tipoHoraExtraOptions: any[] = [];
  filteredFuncionarios: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService,
  ) {
    this.submit = false;

    this.form = this._formBuilder.group({
      id: [null],
      funcionario: [null, [Validators.required]],
      tipoHoraExtraId: [null, [Validators.required]],
      fecha: [null, [Validators.required]],
      cantidad: [null, [Validators.required, Validators.min(1), Validators.max(100)]],

    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {
    this.setHoraExtrasLista();

    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );
  }

  public setHoraExtrasLista(): void {
    this._service.getHoraExtrasLista().then(
      (resp: any[]) => {
        this.tipoHoraExtraOptions = resp;
      }
    );
  }

  displayFnFuncionarios(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  focusData(event): void {
    if (this.form.value.funcionario && this.form.value.funcionario.id) {
      // CA 01 - 02 HU061 V1
      this._service.getDatosActuales(this.form.value.funcionario.id).then(resp => {
        const errors = {};
        if (resp.contrato != null) {
          // Activo, Incapacitado o EnVacaciones

          switch (resp.contrato.estado) {
            case !'Vigente':
              errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
              this.form.get('funcionario').setErrors(errors);
              break;
            case !'EnVacaciones':
              errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
              this.form.get('funcionario').setErrors(errors);
              break;
            case !'Incapacitado':
              errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
              this.form.get('funcionario').setErrors(errors);
              break;
          }

          if (resp.estado !== 'Activo') {
            errors[
              'El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'
            ] = true;
            this.form.get('funcionario').setErrors(errors);
          }

          if (resp.contrato.estadoRegistro !== 'Activo') {
            errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
            this.form.get('funcionario').setErrors(errors);
          }

        } else {
          errors['El funcionario no tiene contrato.'] = true;
          this.form.get('funcionario').setErrors(errors);
        }
      });
    }
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.funcionario != null && typeof value.funcionario !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un funcionario.'] = true;
      formGroup.get('funcionario').setErrors(errors);
    }

    if (value.id == null && value.fecha != null) {
      formGroup.get('fecha').setErrors(null);
      let fecha = value.fecha;
      if (typeof fecha === 'string') {
        fecha = moment(fecha).toDate();
      } else {
        fecha = value.fecha.toDate();
      }
      //
      const actual = moment().toDate();
      actual.setHours(0);
      actual.setMinutes(0);
      actual.setSeconds(0);
      actual.setMilliseconds(0);
      if (fecha.getTime() > actual.getTime()) {
        const errors = {};
        errors['La fecha que intentas ingresar no puede ser mayor que la fecha actual.'] = true;
        formGroup.get('fecha').setErrors(errors);
      }

    }

    return null;
  }

  guardarHandle(event): void {

    this.submit = true;
    const formValue = this.form.value;
    formValue.funcionarioId = formValue.funcionario.id;

    if (formValue.fecha) {
      formValue.fecha = moment(formValue.fecha).format('YYYY-MM-DD');
    }
    this._service.crear(formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
      ).catch((resp: HttpErrorResponse) => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }

        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('snack' in error.errors) {
            const errors = {};
            error.errors.snack.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 6000
              });
            });
          }
          if ('funcionario' in error.errors) {
            const errors = {};
            error.errors.funcionario.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }
          if ('tipoHoraExtraId' in error.errors) {
            const errors = {};
            error.errors.tipoHoraExtraId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoHoraExtraId').setErrors(errors);
          }
          if ('fecha' in error.errors) {
            const errors = {};
            error.errors.fecha.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('fecha').setErrors(errors);
          }
          if ('cantidad' in error.errors) {
            const errors = {};
            error.errors.cantidad.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('cantidad').setErrors(errors);
          }

        }
      });
  }

}
