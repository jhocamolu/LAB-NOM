import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'rangos-uvt-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  element: any;
  id: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
    private _matDialog: MatDialog,
    private _router: Router
  ) {

    this.form = this._formBuilder.group({
      id: [null],
      desde: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(99999)]],
      hasta: [null, [AlcanosValidators.numerico, Validators.max(99999)]],
      porcentaje: [null, [Validators.required, Validators.max(100)]],
      adiciona: [null, [Validators.required, Validators.max(10000)]],
      sustrae: [null, [Validators.required, Validators.max(10000)]],
      fecha: [null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;

  }

  ngOnInit(): void {

    this._service.onRangoChanged.subscribe(data => {
      this.form.patchValue({
        id: data.id,
        desde: data.desde,
        hasta: data.hasta,
        porcentaje: data.porcentaje,
        adiciona: data.adiciona,
        sustrae: data.sustrae,
        fecha: data.validoDesde,

      });

    });

    this.form.get('hasta').valueChanges.subscribe(value => {
      const desde = this.form.get('desde').value;
      const errors = {};
      if (parseInt(value, 10) < parseInt(desde, 10)) {
        this.form.get('hasta').setErrors({ 'El valor  que intentas guardar no puede ser menor que el valor desde.': true });
      } else {
        this.form.get('hasta').setErrors(null);
      }
    });

  }

  get desde(): AbstractControl {
    return this.form.get('desde');
  }

  get hasta(): AbstractControl {
    return this.form.get('hasta');
  }

  get porcentaje(): AbstractControl {
    return this.form.get('porcentaje');
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;


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
      if (fecha.getTime() < actual.getTime()) {
        const errors = {};
        errors['La fecha de validez que intentas guardar no debe ser menor que la fecha actual.'] = true;
        formGroup.get('fecha').setErrors(errors);
      }
    }
    return null;
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.validoDesde = moment(formValue.fecha).format('YYYY-MM-DDTHH:mm:ssZ');
    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/configuracion/rangos-uvt`]);
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
          if ('desde' in error.errors) {
            const errors = {};
            error.errors.desde.forEach(element => {
              errors[element] = true;
            });
            this.form.get('desde').setErrors(errors);
          }

          if ('hasta' in error.errors) {
            const errors = {};
            error.errors.hasta.forEach(element => {
              errors[element] = true;
            });
            this.form.get('hasta').setErrors(errors);
          }

          if ('porcentaje' in error.errors) {
            const errors = {};
            error.errors.porcentaje.forEach(element => {
              errors[element] = true;
            });
            this.form.get('porcentaje').setErrors(errors);
          }

          if ('adiciona' in error.errors) {
            const errors = {};
            error.errors.adiciona.forEach(element => {
              errors[element] = true;
            });
            this.form.get('adiciona').setErrors(errors);
          }

          if ('sustrae' in error.errors) {
            const errors = {};
            error.errors.sustrae.forEach(element => {
              errors[element] = true;
            });
            this.form.get('sustrae').setErrors(errors);
          }

          if ('validoDesde' in error.errors) {
            const errors = {};
            error.errors.validoDesde.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fecha').setErrors(errors);
          }

          if ('snackError' in error.errors) {
            let msg = '';
            error.errors.snackError.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 5000
            });
          }

        }
      });

  }

}
