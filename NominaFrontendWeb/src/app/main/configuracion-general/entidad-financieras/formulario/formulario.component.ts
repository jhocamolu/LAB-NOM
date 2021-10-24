import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
  selector: 'entidad-financieras-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;

  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,

  ) {
    this.submit = false;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];

    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });

    this.form = this._formBuilder.group({
      id: [null],
      codigo: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(999)]],
      nit: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(15)]],
      dv: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(1)]],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(80)]],
      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],
      telefono: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(7), AlcanosValidators.maxLength(10)]],
      direccion: [null, [Validators.required, AlcanosValidators.direccion]],
      representanteLegal: [null, [Validators.required, AlcanosValidators.alfabetico]],

    }, { validators: this.validate });

    this.submit = false;

  }


  ngOnInit(): void {
    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {

        this.item = resp;
        this.id = this.item.id;
        let departamentoOrigenId = null;

        if (this.item.divisionPoliticaNivel2Id != null) {
          departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
        }

        this.form.patchValue({
          id: this.item.id,
          departamentoOrigenId: this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id,
          municipioOrigenId: this.item.divisionPoliticaNivel2Id,
          codigo: this.item.codigo,
          nit: this.item.nit,
          dv: this.item.dv,
          nombre: this.item.nombre,
          telefono: this.item.telefono,
          direccion: this.item.direccion,
          representanteLegal: this.item.representanteLegal,

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

  ngAfterViewInit(): void {
  }

  // get codigo(): AbstractControl {
  //   return this.form.get('codigo');
  // }

  // get nit(): AbstractControl {
  //   return this.form.get('nit');
  // }

  // get dv(): AbstractControl {
  //   return this.form.get('dv');
  // }

  // get nombre(): AbstractControl {
  //   return this.form.get('nombre');
  // }

  // get departamentoOrigenId(): AbstractControl {
  //   return this.form.get('departamentoOrigenId');
  // }

  // get municipioOrigenId(): AbstractControl {
  //   return this.form.get('municipioOrigenId');
  // }

  // get telefono(): AbstractControl {
  //   return this.form.get('telefono');
  // }

  // get direccion(): AbstractControl {
  //   return this.form.get('direccion');
  // }

  // get representanteLegal(): AbstractControl {
  //   return this.form.get('representanteLegal');
  // }



  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): any { // ValidatorFn error
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
        errors[`El DV  es incorrecto, por favor verifica.`] = true;
        formGroup.get('dv').setErrors(errors);

      }
      if ((!isNaN(dv) && dv == value.dv)) {
        formGroup.get('dv').setErrors(null);
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

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/configuracion/entidad-financieras`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        this._alcanosSnackBar.snackbar({
          clase: 'error',
          mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
        });

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
          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }
          if ('departamentoOrigenId' in error.errors) {
            const errors = {};
            error.errors.departamentoOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('departamentoOrigenId').setErrors(errors);
          }
          if ('municipioOrigenId' in error.errors) {
            const errors = {};
            error.errors.municipioOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('municipioOrigenId').setErrors(errors);
          }
          if ('telefono' in error.errors) {
            const errors = {};
            error.errors.telefono.forEach(element => {
              errors[element] = true;
            });
            this.form.get('telefono').setErrors(errors);
          }
          if ('direccion' in error.errors) {
            const errors = {};
            error.errors.direccion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('direccion').setErrors(errors);
          }
          if ('representanteLegal' in error.errors) {
            const errors = {};
            error.errors.representanteLegal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('representanteLegal').setErrors(errors);
          }
        }
        // this._matSnackBar.open(mensaje, 'Aceptar', {
        //   verticalPosition: 'top',
        //   duration: 9000,
        //   panelClass: ['error-snackbar'],
        // });
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
