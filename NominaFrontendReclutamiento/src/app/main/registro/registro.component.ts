import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent, MatSnackBar } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
// Autocompletable
import { Observable, merge } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import { indefinido } from '@alcanos/constantes/contratos';
import * as moment from 'moment';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { RegistroService } from './registro.service';
import { FuseConfigService } from '@fuse/services/config.service';


@Component({
  selector: 'registro-form',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class RegistroComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.portal;

  form: FormGroup;
  submit: boolean;
  generos: any[];
  tipoDocumentos: any[];
  registrado: boolean = false;
  loading: boolean = false;
  /**
   * 
   * @param _formBuilder 
   * @param _alcanosSnackBar 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: RegistroService,
  ) {

    // Configure the layout
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    this.submit = false;
    this.generos = this._service.onGenerosChanged.value;
    this.tipoDocumentos = this._service.onTipoDocumentosChanged.value;

    this.form = this._formBuilder.group({
      id: [null, []],
      primerNombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoNombre: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      primerApellido: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoApellido: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      sexoId: [null, [Validators.required]],
      celular: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(10), AlcanosValidators.maxLength(12)]],
      tipoDocumentoId: [null, [Validators.required]],
      numeroDocumento: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(15)]],
      correoElectronicoPersonal: [null, [AlcanosValidators.correoElectronico, Validators.required]],
      recaptchaReactive: [null, Validators.required],
      checkBox: [null, Validators.required],
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  toogleCheckbox(event) {
    if (!event.checked) {
      this.form.get('checkBox').setValue(null);
    }
  }

  guardarHandle(event): void {
    this.submit = true;
    this.loading = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        // this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.loading = false;
        this.registrado = true;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.loading = false;
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
          if ('primerNombre' in error.errors) {
            const errors = {};
            error.errors.primerNombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('primerNombre').setErrors(errors);
          }

          if ('segundoNombre' in error.errors) {
            const errors = {};
            error.errors.segundoNombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('segundoNombre').setErrors(errors);
          }

          if ('primerApellido' in error.errors) {
            const errors = {};
            error.errors.primerApellido.forEach(element => {
              errors[element] = true;
            });
            this.form.get('primerApellido').setErrors(errors);
          }

          if ('segundoApellido' in error.errors) {
            const errors = {};
            error.errors.segundoApellido.forEach(element => {
              errors[element] = true;
            });
            this.form.get('segundoApellido').setErrors(errors);
          }

          if ('sexoId' in error.errors) {
            const errors = {};
            error.errors.sexoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('sexoId').setErrors(errors);
          }

          if ('celular' in error.errors) {
            const errors = {};
            error.errors.celular.forEach(element => {
              errors[element] = true;
            });
            this.form.get('celular').setErrors(errors);
          }
          if ('tipoDocumentoId' in error.errors) {

            const errors = {};
            error.errors.tipoDocumentoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoDocumentoId').setErrors(errors);
          }

          if ('numeroDocumento' in error.errors) {
            const errors = {};
            error.errors.numeroDocumento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroDocumento').setErrors(errors);
          }

          if ('correoElectronicoPersonal' in error.errors) {
            const errors = {};
            error.errors.correoElectronicoPersonal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('correoElectronicoPersonal').setErrors(errors);
          }

          if ('recaptchaReactive' in error.errors) {
            const errors = {};
            error.errors.recaptchaReactive.forEach(element => {
              errors[element] = true;
            });
            this.form.get('recaptchaReactive').setErrors(errors);
          }

          if ('checkBox' in error.errors) {
            const errors = {};
            error.errors.checkBox.forEach(element => {
              errors[element] = true;
            });
            this.form.get('checkBox').setErrors(errors);
          }
        }
      });
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }
}