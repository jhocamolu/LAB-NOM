import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ArchivoTipo1PilaService } from './crear.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { RouterLink, Router } from '@angular/router';
import { reporteEstadoRegistraduria } from '@alcanos/constantes/reportes-estados';
import * as moment from 'moment';


@Component({
  selector: 'archivo-pila-uno-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArchivoTipo1PilaComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  registraduriaConstant = reporteEstadoRegistraduria;
  espera: boolean = false;
  tipoAcciones: any;
  filesTxt: any;
  mostrar: boolean = false;

  @ViewChild('downloadFile', { static: false }) downloadFile: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<ArchivoTipo1PilaComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: ArchivoTipo1PilaService,
    private _router: Router,
    private _ref: ChangeDetectorRef
  ) {

    this.form = this._formBuilder.group({
      tipoAccionId: [null, []],
      fechaInicial: [null, []],
      fechaFinal: [null, []],
    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.getTipoAcciones().then(resp => {
      this.tipoAcciones = resp;
    });
    // this.form.get('tipoAccionId').valueChanges.subscribe((value) => {
    //   if (value != null) {
    //     this.form.get('fechaInicial').setErrors({ 'required': true });
    //     this.form.get('fechaFinal').setErrors({ 'required': true });
    //   } else {
    //     this.form.get('fechaInicial').setErrors(null);
    //     this.form.get('fechaInicial').setValue(null);
    //     this.form.get('fechaFinal').setErrors(null);
    //     this.form.get('fechaFinal').setValue(null);
    //   }
    // });

    this.form.get('tipoAccionId').valueChanges.subscribe(value => {
      this.mostrar = false;
      if (!value || value == null) {
        this.form.get('fechaInicial').setErrors(null);
        this.form.get('fechaInicial').setValue(null);
        this.form.get('fechaInicial').clearValidators();

        this.form.get('fechaFinal').setErrors(null);
        this.form.get('fechaFinal').setValue(null);
        this.form.get('fechaInicial').clearValidators();
      } else {
        this.mostrar = true;
        this.form.get('fechaInicial').setValidators([Validators.required]);
        this.form.get('fechaFinal').setValidators([Validators.required]);
        // this.form.markAllAsTouched();
      }

      // detecta el cambio disabled https://stackoverflow.com/questions/39787038/how-to-manage-angular2-expression-has-changed-after-it-was-checked-exception-w
      let line = this._ref.detectChanges();
    });
  }

  // Debido a un error en el disabled por un detector Changes se externaliza el invalid
  finalValidacion(submit): any {
    let tipo: boolean = true;

    if (this.form.invalid == true || submit) {
      tipo = true;
    } else {
      tipo = false;
    }

    return tipo;
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;


    if (value.id == null && value.fechaInicial != null) {
      formGroup.get('fechaInicial').setErrors(null);
      let fechaInicial = value.fechaInicial;
      if (typeof fechaInicial === 'string') {
        fechaInicial = moment(fechaInicial).toDate();
      } else {
        fechaInicial = value.fechaInicial.toDate();
      }
      //
      const actual = moment().toDate();
      actual.setHours(0);
      actual.setMinutes(0);
      actual.setSeconds(0);
      actual.setMilliseconds(0);
      if (fechaInicial.getTime() == actual.getTime()) {
        const errors = {};
        errors['La fecha inicial no puede ser igual a la fecha actual.'] = true;
        formGroup.get('fechaInicial').setErrors(errors);
      }

      if (fechaInicial.getTime() > moment().toDate().getTime()) {
        const errors = {};
        errors['La fecha inicial no puede ser posterior a la fecha actual.'] = true;
        formGroup.get('fechaInicial').setErrors(errors);
      }

      // if (fechaInicial.getTime() < moment().subtract(1, 'day').toDate().getTime()) {
      //   const errors = {};
      //   errors['La fecha inicial no puede ser posterior a la fecha actual.'] = true;
      //   formGroup.get('fechaInicial').setErrors(errors);
      // }

    }

    if (value.fechaInicial != null && value.fechaFinal != null) {
      formGroup.get('fechaFinal').setErrors(null);

      let fechaInicial = value.fechaInicial;
      let fechaFinal = value.fechaFinal;

      if (typeof fechaInicial === 'string') {
        fechaInicial = moment(fechaInicial).toDate();
      } else {
        fechaInicial = value.fechaInicial.toDate();
      }

      if (typeof fechaFinal === 'string') {
        fechaFinal = moment(fechaFinal).toDate();
      } else {
        fechaFinal = value.fechaFinal.toDate();
      }
      //
      if (fechaFinal.getTime() > moment().toDate().getTime()) {
        const errors = {};
        errors['La fecha final no puede ser posterior a la fecha actual.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

      if (fechaFinal.getTime() == fechaInicial.getTime()) {
        const errors = {};
        errors['La fecha final no puede ser igual a la fecha inicial.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

      if (fechaFinal.getTime() < fechaInicial.getTime()) {
        const errors = {};
        errors['La fecha final no puede ser anterior a la fecha inicial.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

    }

    return null;
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.espera = true;
    this.submit = true;
    let fechaIn: any = formValue.fechaInicial;
    let fechaOut: any = formValue.fechaFinal;
    if (formValue.fechaInicial) {
      fechaIn = String(fechaIn).split('-');
      if (fechaIn.length > 2) {
        formValue.fechaInicial = formValue.fechaInicial;
      } else {
        formValue.fechaInicial = formValue.fechaInicial.format('YYYY-MM-DD');
      }
    }

    if (formValue.fechaFinal) {
      fechaOut = String(fechaOut).split('-');
      if (fechaOut.length > 2) {
        formValue.fechaFinal = formValue.fechaFinal;
      } else {
        formValue.fechaFinal = formValue.fechaFinal.format('YYYY-MM-DD');
      }
    }

    this._service.crear(formValue)
      .then((resp) => {
        this.submit = false;
        this.espera = false;
        // window.open(resp.url + resp.file, 'Archivo a descargar', 'resizable,scrollbars,status');
        fetch(resp.url + resp.file, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resp.file.replace('/public/', ''));
           // console.log(resp.file.replace('/public/', ''));
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          });

        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        //this.dialogRef.close(true);
      }
      ).catch((resp: HttpErrorResponse) => {

        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('tipoAccionId' in error.errors) {
            const errors = {};
            error.errors.tipoAccionId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoAccionId').setErrors(errors);
          }
          if ('fechaInicial' in error.errors) {
            const errors = {};
            error.errors.fechaInicial.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicial').setErrors(errors);
          }

          if ('fechaFinal' in error.errors) {
            const errors = {};
            error.errors.fechaFinal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFinal').setErrors(errors);
          }

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

        }
      });

  }

}
