import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { isArray } from 'util';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'terceros-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;

  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];
  entidadFinancieras: any[];
  tipoCuentas: any[];



  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,
  ) {

    this.departamentosOrigen = [];
    this.municipiosOrigen = [];

    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });


    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(60)]],
      nit: [null, [Validators.required, AlcanosValidators.maxLength(20), AlcanosValidators.numerico]],
      digitoVerificacion: [null, [Validators.required, Validators.max(9), AlcanosValidators.numerico]],
      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],
      telefono: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1111111), Validators.max(999999999999)]],
      direccion: [null, [Validators.required]],
      entidadFinancieraId: [null, [Validators.required]],
      tipoCuentaId: [null, [Validators.required]],
      numeroCuenta: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(99999999999999999999)]],
      descripcion: [null, [AlcanosValidators.maxLength(300)]],
    }, { validators: this.validate });
    this.submit = false;

    this._service.getEntidadFinancieras().then(resp => {
      this.entidadFinancieras = resp; 
    });

    this._service.getTipoCuentas().then(resp => {
      this.tipoCuentas = resp; 
    });

  }

  ngOnInit(): void {

    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;

        let departamentoOrigenId = null;

        if (this.item.divisionPoliticaNivel2Id != null) {
          departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
        }

        this.form.patchValue({
          id: this.item.id,
          nombre: this.item.nombre,
          nit: this.item.nit,
          digitoVerificacion: this.item.digitoVerificacion,
          departamentoOrigenId: this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id,
          municipioOrigenId: this.item.divisionPoliticaNivel2Id,
          telefono: this.item.telefono,
          direccion: this.item.direccion,
          entidadFinancieraId: this.item.entidadFinancieraId,
          tipoCuentaId: this.item.tipoCuentaId,
          numeroCuenta: this.item.numeroCuenta,
          descripcion: this.item.descripcion
        });

        this.form.markAllAsTouched();

        if (departamentoOrigenId !== null) {
          this._municipios(departamentoOrigenId, this.municipiosOrigen);
        }
      }
    });

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioOrigenId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );

  }

  ngAfterViewInit(): void { }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): any { // ValidatorFn error
    const value = formGroup.value;

    if (value.nit != null && value.digitoVerificacion != null) {

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
      const digitoVerificacion = (y > 1) ? 11 - y : y;
      if (value.digitoVerificacion != "") {
        if (!(!isNaN(digitoVerificacion) && digitoVerificacion == value.digitoVerificacion)) {
          const errors = Object.assign({}, formGroup.get('digitoVerificacion').errors);
          errors[`El DV  es incorrecto, por favor verifica.`] = true;
          formGroup.get('digitoVerificacion').setErrors(errors);

        }
        if ((!isNaN(digitoVerificacion) && digitoVerificacion == value.digitoVerificacion)) {
          formGroup.get('digitoVerificacion').setErrors(null);
        }
      }
    }
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    
    if (formValue.funcionario == null) {
      formValue.divisionPoliticaNivel2Id = formValue.municipioOrigenId;
    }
    else {
      formValue.divisionPoliticaNivel2Id = this.item.divisionPoliticaNivel2Id;
    }
    delete formValue.municipioOrigenId;
    delete formValue.departamentoOrigenId;

    
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/configuracion/terceros`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }
        this._alcanosSnackBar.snackbar({
          clase: 'error',
          mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
        });
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }
          if ('nit' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nit.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nit').setErrors(errors);
          }
          if ('digitoVerificacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.digitoVerificacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('digitoVerificacion').setErrors(errors);
          }
          if ('divisionPoliticaNivel2Id' in resp.error.errors) {
            const errors = {};
            resp.error.errors.divisionPoliticaNivel2Id.forEach(element => {
              errors[element] = true;
            });
            this.form.get('departamentoOrigenId').setErrors(errors);
          }
          if ('divisionPoliticaNivel1Id' in resp.error.errors) {
            const errors = {};
            resp.error.errors.divisionPoliticaNivel1Id.forEach(element => {
              errors[element] = true;
            });
            this.form.get('municipioOrigenId').setErrors(errors);
          }
          if ('telefono' in resp.error.errors) {
            const errors = {};
            resp.error.errors.telefono.forEach(element => {
              errors[element] = true;
            });
            this.form.get('telefono').setErrors(errors);
          }
          if ('direccion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.direccion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('direccion').setErrors(errors);
          }
          if ('entidadFinancieraId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.entidadFinancieraId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('entidadFinancieraId').setErrors(errors);
          }
          if ('tipoCuentaId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.tipoCuentaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoCuentaId').setErrors(errors);
          }
          if ('numeroCuenta' in resp.error.errors) {
            const errors = {};
            resp.error.errors.numeroCuenta.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroCuenta').setErrors(errors);
          }
          if ('descripcion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.descripcion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('descripcion').setErrors(errors);
          }

        }
      });

  }


  private _departamentos(paisId, array: any[]): void {
    this._service.getDepartamentos(paisId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  private _municipios(departamentoId, array: any[]): void {
    this._service.getMunicipios(departamentoId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

}
