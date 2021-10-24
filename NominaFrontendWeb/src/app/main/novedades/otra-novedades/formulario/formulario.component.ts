import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';

import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { claseNovedades } from '@alcanos/constantes/clase-novedades';
import { claseTerceros } from '@alcanos/constantes/clase-terceros';

@Component({
  selector: 'otra-novedades-formulario',
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
  isDisabled = false;


  desabilitar: boolean = false;
  cantidades: boolean = false;
  valores: boolean = false;

  tipoEmbargos: any[];

  // periodicidad
  subPeriodos: any[];

  // unidad
  unidadMedida: any;

  // requiere cantidad o valor
  requiereCantidad: any;

  // periodos
  tipoPeriodos: any;
  tipoPeriodoOrigen = [];

  tipoPeriodosInicial: any;

  subPeriodosOrigen = [];

  funcionarios: any[];
  entidadFinancierasOptions: any[];

  filteredFuncionarios: Observable<string[]>;
  filteredNovedades: Observable<string[]>;

  // filtros de terceros
  filteredTercero: Observable<any[]>;

  claseNovedad = claseNovedades;
  claseTercero = claseTerceros;
  terceroId: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: FormularioService,
  ) {
    this.submit = false;

    this.funcionarios = [];
    this.tipoPeriodos = this._service.onTipoPeriodosChanged.value;
    this.subPeriodos = [];
    this.form = this._formBuilder.group(
      {
        id: [null],
        funcionario: [null, [Validators.required]],
        categoriaNovedadId: [null, [Validators.required]],
        fechaAplicacion: [null, [Validators.required]],
        fechaFinalizacion: [null, [Validators.required]],
        tipoPeriodoId: [null, [Validators.required]],
        subPeriodoId: [null, [Validators.required]],
        cantidad: [null, []],
        valor: [null, [Validators.max(100000000)]],
        terceroId: [null, [Validators.required]],
        observacion: [null, [AlcanosValidators.maxLength(500)]],

      }, { validators: this.validate });

    this.form.get('fechaFinalizacion').disable();
    this.form.get('terceroId').disable();

  }

  ngOnInit(): void {

    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.desabilitar = true;

        this.item = resp;
        this.id = this.item.id;

        if (this.item.id !== null) {
          this._editarPeriodicidad(this.item.id);
        }

        if (this.item.categoriaNovedad !== null && this.item.categoriaNovedad.ubicacionTercero !== null) {
          this.form.get('terceroId').enable();
        }

        this.form.patchValue({
          id: this.item.id,
          funcionario: this.item.funcionario,
          fechaAplicacion: this.item.fechaAplicacion,
          fechaFinalizacion: this.item.fechaFinalizacion,
          categoriaNovedadId: this.item.categoriaNovedad,
          valorCuota: this.item.valorCuota,
          numeroCuotas: this.item.numeroCuotas,
          entidadFinancieraId: this.item.entidadFinancieraId,
          observacion: this.item.observacion,
          cantidad: this.item.cantidad,
          valor: this.item.valor,
        });

        this.cantidadValor(this.item.categoriaNovedad.conceptoNomina);
        this.unidad(this.item.categoriaNovedad.conceptoNomina);
        this.tercero(this.item.categoriaNovedad.requiereTercero);
        this.fechaFinalizacionControl(this.item.categoriaNovedad.clase);

        this.form.markAllAsTouched();

        // Desabilitar campos en el editar
        this.form.get('funcionario').disable();

        if (this.item.terceroId !== null && this.item.categoriaNovedad !== null && this.item.categoriaNovedad.ubicacionTercero === 'Administradora') {
          this._service.getTerceroAdministradorasSolo(this.item.terceroId)
            .then(resp => {
              this.terceroId = resp;
              this.form.patchValue({
                terceroId: resp
              });
            });
        }

        if (this.item.terceroId !== null && this.item.categoriaNovedad !== null && this.item.categoriaNovedad.ubicacionTercero === 'EntidadFinanciera') {
          this._service.getTerceroEntidadFinancierasSolo(this.item.terceroId)
            .then(resp => {
              this.terceroId = resp;
              this.form.patchValue({
                terceroId: resp
              });
            });
        }

        if (this.item.terceroId !== null && this.item.categoriaNovedad !== null && this.item.categoriaNovedad.ubicacionTercero === 'OtrosTerceros') {
          this._service.getTerceroOtroTerceroSolo(this.item.terceroId)
            .then(resp => {
              this.terceroId = resp;
              this.form.patchValue({
                terceroId: resp
              });
            });
        }

      }
    });

    this.form.get('tipoPeriodoId').valueChanges.subscribe(value => {
      this.subPeriodos = [];
      this.form.get('subPeriodoId').setValue(null);
      if (value != null) {
        this._periodicidad(value);
      }
    });


    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );

    this.filteredNovedades = this.form.get('categoriaNovedadId')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getNovedades(value))
      );


    this.filteredTercero = this.form.get('terceroId')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.selectTercero(value))

      );

    this.form.get('categoriaNovedadId').valueChanges.subscribe(
      (value) => {
        this.unidad(value.conceptoNomina);
        this.fechaFinalizacionControl(value.clase);
        this.cantidadValor(value.conceptoNomina);
        this.tercero(value.requiereTercero);
        // limpiar el filtro de terceros y la seleccion
        this.form.get('terceroId').setValue(null);
        this.selectTercero(null);
      }
    );


  }

  selectTercero(value: any[]): any[] {
    let result: any = [];
    const novedad = this.form.get('categoriaNovedadId').value;
    if (novedad && novedad.ubicacionTercero) {
      switch (novedad.ubicacionTercero) {
        case 'Administradora':
          result = this._service.getTerceroAdministradoras(value);
          break;
        case 'EntidadFinanciera':
          result = this._service.getTerceroEntidadFinancieras(value);
          break;
        case 'OtrosTerceros':
          result = this._service.getTerceroOtroTercero(value);
          break;
        default:
          break;
      }
    }
    return result;
  }

  unidad(unidad: any): void {
    if (unidad != null) {
      this.unidadMedida = unidad.unidadMedida;
    }
  }

  cantidadValor(value: any): void {
    if (value != null) {
      this.requiereCantidad = value.requiereCantidad;
      switch (this.requiereCantidad) {
        case true:
          const errors = {};
          errors['Requerido'] = true;
          // this.cantidades = true;
          this.valores = false;
          this.form.get('valor').clearValidators();
          this.form.get('valor').setErrors(null);
          this.form.get('valor').setValue(null);
          this.form.get('cantidad').enable();
          this.form.get('cantidad').setValidators([Validators.required, AlcanosValidators.numerico, Validators.max(100000)]);
          break;
        case false:
          // this.cantidades = false;
          // this.form.get('cantidad').disable();
          this.form.get('cantidad').clearValidators();
          this.form.get('cantidad').setErrors(null);
          this.form.get('cantidad').setValue(null);
          this.valores = true;
          this.form.get('valor').enable();
          this.form.get('valor').setValidators([Validators.required, Validators.max(100000000)]);
          break;

      }
    }
  }

  fechaFinalizacionControl(clase: string): void {
    switch (clase) {
      case claseNovedades.fija:
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('fechaFinalizacion').enable();
        this.form.get('fechaFinalizacion').clearValidators();
        this.form.get('fechaFinalizacion').setErrors(errors);
        break;
      case claseNovedades.eventual:
        this.form.get('fechaFinalizacion').disable();
        break;
      default:
        this.form.get('fechaFinalizacion').clearValidators();
        this.form.get('fechaFinalizacion').setErrors(null);
        this.form.get('fechaFinalizacion').disable();
        break;
    }

  }

  tercero(tercero: any): void {
    switch (tercero) {
      case true:
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('terceroId').enable();
        this.form.get('terceroId').clearValidators();
        this.form.get('terceroId').setErrors(errors);
        this.form.get('terceroId').setValidators([Validators.required]);
        break;
      case false:
        this.form.get('terceroId').disable();
        break;
      // default:
      //   this.form.get('terceroId').clearValidators();
      //   this.form.get('terceroId').setErrors(null);
      //   this.form.get('terceroId').disable();
      //   break;
    }

  }

  ngAfterViewInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  strToDateFormat(str: string): string {
    moment.locale('es');
    return moment(str).format('MMM DD, Y  ');
  }

  focusData(event): void {

    if (!this.id) {
      if (this.form.value.funcionario && this.form.value.funcionario.id) {
        // CA 02
        this._service.getDatosActuales(this.form.value.funcionario.id)
          .then(resp => {
            const errors = {};
            if (resp.contrato != null) {
              switch (resp.contrato.estado) {
                case !'Vigente':
                  errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
                  this.form.get('funcionario').setErrors(errors);
                  break;
                case !'PendientePorLiquidar':
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
            } else {
              errors[
                'El funcionario no tiene contrato.'
              ] = true;
              this.form.get('funcionario').setErrors(errors);
            }
          });
      }
    }
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.id == null) {
      if (value.fechaAplicacion) {
        const fechaAplicacion = moment(value.fechaAplicacion).toDate();

        const actual = moment().toDate();
        actual.setHours(0);
        actual.setMinutes(0);
        actual.setSeconds(0);
        actual.setMilliseconds(0);
        if (fechaAplicacion.getTime() > actual.getTime()) {
          const errors = {};
          errors['La fecha que intentas ingresar no debe ser mayor que la fecha actual.'] = true;
          formGroup.get('fechaAplicacion').setErrors(errors);
        }
      }
    }

    if (value.fechaAplicacion && value.fechaFinalizacion) {
      const fechaAplicacion = moment(value.fechaAplicacion).toDate();
      const fechaFinalizacion = moment(value.fechaFinalizacion).add(1, 'day').toDate();
      formGroup.get('fechaFinalizacion').setErrors(null);

      if (fechaAplicacion.getTime() >= fechaFinalizacion.getTime()
      ) {
        const errors = {};
        errors[
          'La fecha de finalización que intentas ingresar no debe ser menor que la fecha de aplicación.'
        ] = true;
        formGroup.get('fechaFinalizacion').setErrors(errors);
      }
    }

    if (value.funcionario != null && typeof value.funcionario !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un funcionario.'] = true;
      formGroup.get('funcionario').setErrors(errors);
    }

    if (value.categoriaNovedadId != null && typeof value.categoriaNovedadId !== 'object') {
      const errors = {};
      errors['Por favor, seleccione una novedad.'] = true;
      formGroup.get('categoriaNovedadId').setErrors(errors);
    }

    if (value.terceroId != null && typeof value.terceroId !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un tercero.'] = true;
      formGroup.get('terceroId').setErrors(errors);
    }

    return null;
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
    formValue.periodicidad = null;

    if (formValue.funcionario == null) {
      formValue.funcionarioId = this.item.funcionario.id;
    }
    else {
      formValue.funcionarioId = formValue.funcionario.id;
    }

    if (formValue.categoriaNovedadId == null) {
      formValue.categoriaNovedadId = this.item.categoriaNovedadId.id;
    }
    else {
      formValue.categoriaNovedadId = formValue.categoriaNovedadId.id;
    }

    if (formValue.terceroId == null) {
      formValue.terceroId = null;
    }
    else {
      formValue.terceroId = formValue.terceroId.id;
    }

    formValue.unidad = this.unidadMedida;

    if (formValue.subPeriodoId != null) {
      const array: any[] = [];
      formValue.subPeriodoId.forEach(element => {
        array.push({ subPeriodoId: element });
      });
      formValue.periodicidad = array;
    }
    formValue.periodicidad = formValue.subPeriodoId;
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/novedades/otra-novedades`]);
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
          if ('snackError' in error.errors) {
            let msg = '';
            error.errors.snackError.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000
            });
          }
          if ('funcionarioId' in error.errors) {
            const errors = {};
            error.errors.funcionarioId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }

          if ('categoriaNovedadId' in error.errors) {
            const errors = {};
            error.errors.categoriaNovedadId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('categoriaNovedadId').setErrors(errors);
          }
          if ('fechaAplicacion' in error.errors) {
            const errors = {};
            error.errors.fechaAplicacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaAplicacion').setErrors(errors);
          }
          if ('fechaFinalizacion' in error.errors) {
            const errors = {};
            error.errors.fechaFinalizacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFinalizacion').setErrors(errors);
          }
          if ('tipoPeriodoId' in error.errors) {
            const errors = {};
            error.errors.tipoPeriodoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoPeriodoId').setErrors(errors);
          }
          if ('subPeriodoId' in error.errors) {
            const errors = {};
            error.errors.subPeriodoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('subPeriodoId').setErrors(errors);
          }

          if ('cantidad' in error.errors) {
            const errors = {};
            error.errors.cantidad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cantidad').setErrors(errors);
          }

          if ('valor' in error.errors) {
            const errors = {};
            error.errors.valor.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valor').setErrors(errors);
          }
          if ('terceroId' in error.errors) {
            const errors = {};
            error.errors.terceroId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('terceroId').setErrors(errors);
          }

          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }



        }
        // this._matSnackBar.open(mensaje, 'Aceptar', {
        //   verticalPosition: 'top',
        //   duration: 9000,
        //   panelClass: ['error-snackbar'],
        // });
      });

  }


  displayFnFuncionarios(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  displayFnNovedades(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnTerceros(element: any): string {
    return element ? `${element.nit} - ${element.nombre}` : element;
  }


  private _periodicidad(periodicidadId): void {
    this._service.getSubPeriodos(periodicidadId).then((response: any[]) => {
      this.subPeriodos = response;
    });
  }

  private _editarPeriodicidad(beneficioId): void {
    const arrayPeriodos = [];
    arrayPeriodos.push({
      id: this.tipoPeriodos[0].id,
      nombre: this.tipoPeriodos[0].nombre
    });

    this._service.getNovedadSubperiodos(beneficioId).then((response: any) => {
      const resp = response[0];

      this.tipoPeriodos.find(periodo => {
        if (periodo.id !== resp.subperiodo.tipoPeriodoId) {
          arrayPeriodos.push({
            id: resp.subperiodo.tipoPeriodoId,
            nombre: resp.subperiodo.tipoPeriodo.nombre
          });
        }
      });
      this.tipoPeriodos = arrayPeriodos;
      this._periodicidad(resp.subperiodo.tipoPeriodoId);
      this.form.patchValue({ tipoPeriodoId: resp.subperiodo.tipoPeriodo.id });
      const array = [];
      response.map(element => {
        array.push(element.subperiodoId);
      });

      this.form.patchValue({
        subPeriodoId: array
      });

    });
  }

}

