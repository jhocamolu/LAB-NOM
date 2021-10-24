import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTabChangeEvent } from '@angular/material';
import { FamiliaresService } from './familiares-form.service';
import { fuseAnimations } from '@fuse/animations';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'funcionarios-familiares-form',
  templateUrl: './familiares-form.component.html',
  styleUrls: ['./familiares-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FamiliaresFormComponent implements OnInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  itemFuncionario: any;
  itemFamiliar: any | null;

  //
  sexos: any[];
  parentescos: any[];
  paises: any[];
  departamentos: any[];
  municipios: any[];
  tipoDocumentos: any[];
  nivelEducativos: any[];

  /**
   * 
   * @param _formBuilder 
   * @param _alcanosSnackBar 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: FamiliaresService,
  ) {
    this.submit = false;
    this.itemFuncionario = this._service.itemFuncionario;
    this.sexos = this._service.onSexosChanged.value;
    this.parentescos = this._service.onParentescosChanged.value;
    this.paises = this._service.onPaisesChanged.value;
    this.departamentos = [];
    this.municipios = [];
    this.tipoDocumentos = this._service.onTipoDocumentosChanged.value;
    this.nivelEducativos = this._service.onNivelEducativosChanged.value;

    this.form = this._formBuilder.group({
      id: [null],
      funcionarioId: [this.itemFuncionario.id],
      primerNombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoNombre: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      primerApellido: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoApellido: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      sexoId: [null, [Validators.required]],
      parentescoId: [null, [Validators.required]],
      dependiente: [null, [Validators.required]],
      tipoDocumentoId: [null, [Validators.required]],
      numeroDocumento: [null, [Validators.required]],
      nivelEducativoId: [null, []],
      fechaNacimiento: [null, [Validators.required]],
      paisId: [null, [Validators.required]],
      departamentoId: [null, [Validators.required]],
      divisionPoliticaNivel2Id: [null, [Validators.required]],
      celular: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1000000000), Validators.max(999999999999)]],
      telefonoFijo: [null, [AlcanosValidators.numerico, Validators.min(1000000), Validators.max(9999999999)]],
      direccion: [null, [Validators.required, AlcanosValidators.direccion]],
    }, { validator: this.validateFamiliares });

  }

  ngOnInit(): void {
    this._service.onItemFamiliarChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.itemFamiliar = response;
          let paisId = null;
          let departamentoId = null;

          if (this.itemFamiliar.divisionPoliticaNivel2 != null && this.itemFamiliar.divisionPoliticaNivel2.divisionPoliticaNivel1 != null) {
            paisId = this.itemFamiliar.divisionPoliticaNivel2.divisionPoliticaNivel1.paisId;
            departamentoId = this.itemFamiliar.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
          }

          this.form.patchValue({
            id: this.itemFamiliar.id,
            primerNombre: this.itemFamiliar.primerNombre,
            segundoNombre: this.itemFamiliar.segundoNombre,
            primerApellido: this.itemFamiliar.primerApellido,
            segundoApellido: this.itemFamiliar.segundoApellido,
            sexoId: this.itemFamiliar.sexoId,
            parentescoId: this.itemFamiliar.parentescoId,
            dependiente: this.itemFamiliar.dependiente,
            tipoDocumentoId: this.itemFamiliar.tipoDocumentoId,
            numeroDocumento: this.itemFamiliar.numeroDocumento,
            nivelEducativoId: this.itemFamiliar.nivelEducativoId,
            fechaNacimiento: this.itemFamiliar.fechaNacimiento,
            paisId: paisId,
            departamentoId: departamentoId,
            divisionPoliticaNivel2Id: this.itemFamiliar.divisionPoliticaNivel2Id,
            celular: this.itemFamiliar.celular,
            telefonoFijo: this.itemFamiliar.telefonoFijo,
            direccion: this.itemFamiliar.direccion,
          });
          this.form.markAllAsTouched();
          if (paisId !== null) {
            this._departamentos(paisId, this.departamentos);
          }

          if (departamentoId !== null) {
            this._municipios(departamentoId, this.municipios);
          }

        }
      }
    );

    this.form.get('paisId').valueChanges.subscribe(
      (value) => {
        this.departamentos = [];
        this.municipios = [];
        this.form.get('departamentoId').setValue(null);
        this.form.get('divisionPoliticaNivel2Id').setValue(null);
        if (value != null) {
          this._departamentos(value, this.departamentos);
        }
      }
    );

    this.form.get('departamentoId').valueChanges.subscribe(
      (value) => {
        this.municipios = [];
        this.form.get('divisionPoliticaNivel2Id').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipios);
        }
      }
    );
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateFamiliares(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.fechaNacimiento != null) {
      let fecha = value.fechaNacimiento;
      if (typeof fecha === 'string') {
        fecha = new Date(fecha);
      } else {
        fecha = value.fechaNacimiento.toDate();
      }
      const hoy = new Date(new Date().setFullYear(new Date().getFullYear()));

      if (fecha.getTime() > hoy.getTime()) {
        const errors = {};
        errors['La fecha de nacimiento debe ser menor a la fecha actual.'] = true;
        formGroup.get('fechaNacimiento').setErrors(errors);
      }

    }

    return null;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }



  tabChangeHandle(event: MatTabChangeEvent): void {
    this._router.navigate([`/administracion-personal/funcionarios/${this.itemFuncionario.id}/mostrar`],
      { queryParams: { tab: event.index } });
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/administracion-personal/funcionarios/${this.itemFuncionario.id}/mostrar`],
          {
            queryParams: {
              tab: 1
            }
          }
        );
      })
      .catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {

          if ('primerNombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.primerNombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('primerNombre').setErrors(errors);
          }

          if ('segundoNombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.segundoNombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('segundoNombre').setErrors(errors);
          }

          if ('primerApellido' in resp.error.errors) {
            const errors = {};
            resp.error.errors.primerApellido.forEach(element => {
              errors[element] = true;
            });
            this.form.get('primerApellido').setErrors(errors);
          }

          if ('segundoApellido' in resp.error.errors) {
            const errors = {};
            resp.error.errors.segundoApellido.forEach(element => {
              errors[element] = true;
            });
            this.form.get('segundoApellido').setErrors(errors);
          }

          if ('sexoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.sexoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('sexoId').setErrors(errors);
          }

          if ('parentescoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.parentescoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('parentescoId').setErrors(errors);
          }

          if ('dependiente' in resp.error.errors) {
            const errors = {};
            resp.error.errors.dependiente.forEach(element => {
              errors[element] = true;
            });
            this.form.get('dependiente').setErrors(errors);
          }

          if ('tipoDocumentoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.tipoDocumentoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoDocumentoId').setErrors(errors);
          }

          if ('numeroDocumento' in resp.error.errors) {
            const errors = {};
            resp.error.errors.numeroDocumento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroDocumento').setErrors(errors);
          }

          if ('nivelEducativoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nivelEducativoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nivelEducativoId').setErrors(errors);
          }

          if ('fechaNacimiento' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaNacimiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaNacimiento').setErrors(errors);
          }

          if ('paisId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.paisId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('paisId').setErrors(errors);
          }

          if ('departamentoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.departamentoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('departamentoId').setErrors(errors);
          }

          if ('divisionPoliticaNivel2Id' in resp.error.errors) {
            const errors = {};
            resp.error.errors.divisionPoliticaNivel2Id.forEach(element => {
              errors[element] = true;
            });
            this.form.get('divisionPoliticaNivel2Id').setErrors(errors);
          }

          if ('celular' in resp.error.errors) {
            const errors = {};
            resp.error.errors.celular.forEach(element => {
              errors[element] = true;
            });
            this.form.get('celular').setErrors(errors);
          }

          if ('direccion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.direccion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('direccion').setErrors(errors);
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
