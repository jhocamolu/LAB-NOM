import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { estadoRequisicionPersonalAlcanos, estadoTipoReclutamientoRequisicionPersonalAlcanos } from '@alcanos/constantes/estado-requisicion-personal';
import { claseSustitutos } from '@alcanos/constantes/clase-sustitutos';

@Component({
  selector: 'formulario-requisiciones-personal',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.gestorArchivos;
  estadoTipoReclutamiento: any = estadoTipoReclutamientoRequisicionPersonalAlcanos;
  claseSustitutos: any = claseSustitutos;
  form: FormGroup;
  submit: boolean;
  item: any;

  //
  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];
  funcionarios: any[];
  tipoContratos: any[];
  dependencias: any[];
  centroCostos: any[];
  motivoVacantes: any[];
  //
  cargoDependenciaSolicitante: any[];
  dependenciaSolicitado: any[];
  centroOperativos: any[];
  id: number;


  filteredFuncionarios: Observable<any>;
  filteredFuncionariosRemplaza: Observable<any>;
  filteredCentroCostos: Observable<string[]>;
  filteredCargoSolicitado: Observable<string[]>;

  cargoSolicitante: number;
  cargoSolicitado: number;


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
    private _service: FormularioService,
  ) {
    this.submit = false;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    this.cargoDependenciaSolicitante = [];
    // this.grupos = [];
    this.funcionarios = [];

    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });

    this.tipoContratos = this._service.onTipoContratosChanged.value;
    this.dependencias = this._service.onDependenciasChanged.value;
    this.centroCostos = this._service.onCentroCostosChanged.value;
    this.centroOperativos = this._service.onCentroOperativosChanged.value;
    this.motivoVacantes = this._service.onMotivoVacantes.value;


    this.form = this._formBuilder.group({
      id: [null],
      dependenciaSolicitante: [null, [Validators.required]],
      cargoDependenciaSolicitanteId: [null, [Validators.required]],
      centroOperativoSolicitanteId: [null, [Validators.required]],
      funcionario: [null, [Validators.required]],
      cargoDependenciaSolicitadoId: [null, [Validators.required]],
      dependenciaSolicitado: [null, [Validators.required]],
      centroOperativoSolicitadoId: [null, [Validators.required]],
      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],
      cantidad: [null, [Validators.required, AlcanosValidators.maxLength(3)]],
      tipoContratoId: [null, [Validators.required]],
      centroCosto: [null, [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, []],
      motivoVacanteId: [null, [Validators.required]],
      funcionarioAQuienReemplaza: [null, []],
      perfilCargo: [null, [Validators.required, AlcanosValidators.maxLength(1000)]],
      competenciaCargo: [null, [Validators.required, AlcanosValidators.maxLength(1000)]],
      tipoReclutamiento: [null, []],
      salario: [null, [Validators.max(999999999)]],
      salarioPortalReclutamiento: [null, []],
      perfilPortalReclutamiento: [null, []],
      competenciaPortalReclutamiento: [null, []],
      observacion: [null, [AlcanosValidators.maxLength(1000)]],
    }, { validator: this.validateDatosBasicos });
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.item = response;
          this.id = this.item.id;
          let departamentoOrigenId = null;
          const dependenciaId = null;
          const cargoId = null;

          if (this.item.divisionPoliticaNivel2Id != null && this.item.divisionPoliticaNivel2.divisionPoliticaNivel1 != null) {
            departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
          }
          /// dependiente del cargo solicitante
          this._cargos(this.item.cargoDependenciaSolicitante.dependenciaId);
          // Dependiente solicitante
          this._service.getDependenciaAdicionales(this.item.cargoDependenciaSolicitado.cargoId).then(resp => {
            this.dependenciaSolicitado = resp;
          });

          this.form.patchValue({
            id: this.item.id,
            dependenciaSolicitante: this.item.cargoDependenciaSolicitante.dependenciaId,
            cargoDependenciaSolicitanteId: this.item.cargoDependenciaSolicitante.id,
            centroOperativoSolicitanteId: this.item.centroOperativoSolicitanteId,
            funcionario: this.item.funcionarioSolicitante,
            cargoDependenciaSolicitadoId: this.item.cargoDependenciaSolicitado,
            dependenciaSolicitado: this.item.cargoDependenciaSolicitado.dependenciaId,
            centroOperativoSolicitadoId: this.item.centroOperativoSolicitadoId,
            departamentoOrigenId: this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id,
            municipioOrigenId: this.item.divisionPoliticaNivel2Id,
            cantidad: this.item.cantidad,
            tipoContratoId: this.item.tipoContratoId,
            centroCosto: this.item.centroCosto,
            fechaInicio: this.item.fechaInicio,
            fechaFin: this.item.fechaFin,
            motivoVacanteId: this.item.motivoVacanteId,
            funcionarioAQuienReemplaza: this.item.funcionarioAQuienReemplaza,
            perfilCargo: this.item.perfilCargo,
            competenciaCargo: this.item.competenciaCargo,
            tipoReclutamiento: this.item.tipoReclutamiento,
            salario: this.item.salario,
            salarioPortalReclutamiento: this.item.salarioPortalReclutamiento,
            perfilPortalReclutamiento: this.item.perfilPortalReclutamiento,
            competenciaPortalReclutamiento: this.item.competenciaPortalReclutamiento,
            observacion: this.item.observacion
          });



          if (this.item.tipoContrato.terminoIndefinido === true) {
            const errors = {};
            errors['Requerido'] = true;
            this.form.get('fechaFin').setErrors(errors);
          }

          if (this.item.motivoVacante.requiereNombreAQuienReemplaza === true) {
            const errors = {};
            errors['Requerido'] = true;
            this.form.get('funcionarioAQuienReemplaza').setErrors(errors);
          }

          if (departamentoOrigenId !== null) {
            this._municipios(departamentoOrigenId, this.municipiosOrigen);
          }

          if (dependenciaId !== null) {
            this._cargos(dependenciaId);
          }

          this.centroOperativoSolicitado(this.item.cargoDependenciaSolicitado.cargo.clase);
          this.centroOperativoSolicitante(this.item.cargoDependenciaSolicitante.cargo.clase);
          this.form.markAllAsTouched();
        }
      }
    );

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioOrigenId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );


    // Este codigo apunta al value change de información del cargo solicitado actualiza 
    // el disabled, actualiza la base de cargoID del centro Operativo y bloquea el funcionario a quien remplaza
    this.form.get('cargoDependenciaSolicitadoId').valueChanges.subscribe(
      (value) => {
        if (value.id) {
          this.centroOperativoSolicitado(value.cargo.clase);
          this.cargoSolicitado = value.cargoId;
          this._service.getDependenciaAdicionales(value.cargoId).then((resp) => {
            this.dependenciaSolicitado = resp;
          });
        }
        if (this.form.get('funcionarioAQuienReemplaza').value != null) {
          this.form.get('funcionarioAQuienReemplaza').setValue(null);
        }
      }
    );


    // Este codigo apunta al value change de información del solicitante actualiza 
    // el disabled, actualiza la base de cargoID del centro Operativo y bloquea el funcionario
    this.form.get('cargoDependenciaSolicitanteId').valueChanges.subscribe(
      (value) => {
        if (value) {
          this._service.getClaseCargoDependencias(value).then(resp => {
            this.cargoSolicitante = resp.cargo.id;
            this.centroOperativoSolicitante(resp.cargo.clase);
          });
        }

        if (this.form.get('funcionario').value != null) {
          this.form.get('funcionario').setValue(null);
        }
      }
    );

    this.form.get('dependenciaSolicitante').valueChanges.subscribe(
      (value) => {
        if (value != null) {
          this._cargos(value);
        }
      }
    );

    this.form.get('tipoContratoId').valueChanges.subscribe((value) => {
      if (value != null) {
        this.terminoIndefinido(value);
      }
    });

    this.form.get('motivoVacanteId').valueChanges.subscribe((value) => {
      if (value != null) {
        this.requiereNombreAQuienReemplaza(value);
      }
    });


    this.filteredCargoSolicitado = this.form.get('cargoDependenciaSolicitadoId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getSoloCargoDependencias(value))
      );

    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.funcionarioSolicitante(value))
      );


    this.filteredFuncionariosRemplaza = this.form.get('funcionarioAQuienReemplaza')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.funcionarioSolicitado(value))
      );

    this.filteredCentroCostos = this.form.get('centroCosto')
      .valueChanges.pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filterCentroCostos(view) : this.centroCostos.slice())
        ),
      );
  }

  ngAfterViewInit(): void {
  }


  funcionarioSolicitante(value: any): any {
    const dependencia = this.form.get('dependenciaSolicitante').value;
    const cargo = this.cargoSolicitante;
    const centro = this.form.get('centroOperativoSolicitanteId').value;
    if (dependencia != null && cargo != null) {
      if (dependencia && cargo && centro) {
        return this._service.getFuncionariosEspecial(value, dependencia, cargo, centro);
      }
      if (dependencia && cargo) {
        return this._service.getFuncionariosEspecial(value, dependencia, cargo, null);
      }
    }

    return this._service.getFuncionarios(value);
  }


  funcionarioSolicitado(value: any): any {
    const cargo = this.cargoSolicitado;
    const dependencia = this.form.get('dependenciaSolicitado').value;
    const centro = this.form.get('centroOperativoSolicitadoId').value;

    if (dependencia != null && cargo != null) {
      if (dependencia && cargo && centro) {
        return this._service.getFuncionariosEspecial(value, dependencia, cargo, centro);
      }
      if (dependencia && cargo) {
        return this._service.getFuncionariosEspecial(value, dependencia, cargo, null);
      }
    }

    return this._service.getFuncionarios(value);
  }

  terminoIndefinido(value: any): void {
    this._service.getTerminoIndefinido(value).then(resp => {
      if (!resp.terminoIndefinido) {
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('fechaFin').setErrors(errors);
      } else {
        this.form.get('fechaFin').clearValidators();
        this.form.get('fechaFin').setErrors(null);
      }
    });
  }

  requiereNombreAQuienReemplaza(value: any): void {
    this._service.getRequiereNombreAQuienReemplaza(value).then(resp => {
      if (resp.requiereNombreAQuienReemplaza) {
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('funcionarioAQuienReemplaza').setErrors(errors);
      } else {
        this.form.get('funcionarioAQuienReemplaza').clearValidators();
        this.form.get('funcionarioAQuienReemplaza').setErrors(null);
      }
    });
  }

  // Las funciones centroOperativoSolicitante y centroOperativoSolicitado de centro operativo obtienen la clase y habilitan o desabilitan el campo

  centroOperativoSolicitante(clase: string): void {
    switch (clase) {
      case claseSustitutos.centroOperativo:
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('centroOperativoSolicitanteId').setErrors(errors);
        this.form.get('centroOperativoSolicitanteId').enable();
        break;
      case claseSustitutos.nacional:
        this.form.get('centroOperativoSolicitanteId').disable();
        this.form.get('centroOperativoSolicitanteId').setValue(null);
        this.form.get('centroOperativoSolicitanteId').clearValidators();
        this.form.get('centroOperativoSolicitanteId').setErrors(null);
        break;
      default:

        this.form.get('centroOperativoSolicitanteId').clearValidators();
        this.form.get('centroOperativoSolicitanteId').setErrors(null);
        break;
    }
  }

  centroOperativoSolicitado(clase: string): void {
    switch (clase) {
      case claseSustitutos.centroOperativo:
        const errors = {};
        errors['Requerido'] = true;
        this.form.get('centroOperativoSolicitadoId').setErrors(errors);
        this.form.get('centroOperativoSolicitadoId').enable();
        break;
      case claseSustitutos.nacional:
        this.form.get('centroOperativoSolicitadoId').disable();
        this.form.get('centroOperativoSolicitadoId').setValue(null);
        this.form.get('centroOperativoSolicitadoId').clearValidators();
        this.form.get('centroOperativoSolicitadoId').setErrors(null);
        break;
      default:
        this.form.get('centroOperativoSolicitadoId').clearValidators();
        this.form.get('centroOperativoSolicitadoId').setErrors(null);
        break;
    }
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    if (formValue.municipioOrigenId != null) {
      formValue.divisionPoliticaNivel2Id = formValue.municipioOrigenId;
    }
    else {
      formValue.divisionPoliticaNivel2Id = this.item.divisionPoliticaNivel2Id;
    }

    if (formValue.funcionario != null) {
      formValue.funcionarioSolicitanteId = formValue.funcionario.id;
      delete formValue.funcionario;
    }

    if (formValue.funcionarioAQuienReemplaza != null) {
      formValue.funcionarioAQuienReemplazaId = formValue.funcionarioAQuienReemplaza.id;
      delete formValue.funcionarioAQuienReemplaza;
    }

    if (formValue.centroCosto != null) {
      formValue.centroCostoId = formValue.centroCosto.id;
      delete formValue.centroCosto;
    }

    if (formValue.cargoDependenciaSolicitadoId != null) {
      formValue.cargoDependenciaSolicitadoId = formValue.cargoDependenciaSolicitadoId.id;
    }

    if (formValue.fechaInicio) {
      formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DD');
    }

    if (formValue.fechaFin) {
      formValue.fechaFin = moment(formValue.fechaFin).format('YYYY-MM-DD');
    }

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/reclutamiento-seleccion/requisiciones-personal/${resp.id}/mostrar`]);
        this.submit = false;
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
          if ('cargoDependenciaSolicitanteId' in error.errors) {
            const errors = {};
            error.errors.cargoDependenciaSolicitanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cargoDependenciaSolicitanteId').setErrors(errors);
          }

          if ('centroOperativoSolicitanteId' in error.errors) {
            const errors = {};
            error.errors.centroOperativoSolicitanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroOperativoSolicitanteId').setErrors(errors);
          }

          if ('funcionarioSolicitanteId' in error.errors) {
            const errors = {};
            error.errors.funcionarioSolicitanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }

          if ('cargoDependenciaSolicitadoId' in error.errors) {
            const errors = {};
            error.errors.cargoDependenciaSolicitadoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cargoDependenciaSolicitadoId').setErrors(errors);
          }

          if ('centroOperativoSolicitadoId' in error.errors) {
            const errors = {};
            error.errors.centroOperativoSolicitadoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroOperativoSolicitadoId').setErrors(errors);
          }

          if ('divisionPoliticaNivel2Id' in error.errors) {
            const errors = {};
            error.errors.divisionPoliticaNivel2Id.forEach(element => {
              errors[element] = true;
            });
            this.form.get('municipioOrigenId').setErrors(errors);
          }

          if ('cantidad' in error.errors) {
            const errors = {};
            error.errors.cantidad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cantidad').setErrors(errors);
          }

          if ('tipoContratoId' in error.errors) {
            const errors = {};
            error.errors.tipoContratoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoContratoId').setErrors(errors);
          }

          if ('centroCosto' in error.errors) {
            const errors = {};
            error.errors.centroCosto.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroCosto').setErrors(errors);
          }

          if ('fechaInicio' in error.errors) {
            const errors = {};
            error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }

          if ('fechaFin' in error.errors) {
            const errors = {};
            error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFin').setErrors(errors);
          }

          if ('motivoVacanteId' in error.errors) {
            const errors = {};
            error.errors.motivoVacanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('motivoVacanteId').setErrors(errors);
          }

          if ('funcionarioAQuienReemplazaId' in error.errors) {
            const errors = {};
            error.errors.funcionarioAQuienReemplazaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionarioAQuienReemplaza').setErrors(errors);
          }

          if ('perfilCargo' in error.errors) {
            const errors = {};
            error.errors.perfilCargo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('perfilCargo').setErrors(errors);
          }

          if ('competenciaCargo' in error.errors) {
            const errors = {};
            error.errors.competenciaCargo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('competenciaCargo').setErrors(errors);
          }

          if ('tipoReclutamiento' in error.errors) {
            const errors = {};
            error.errors.tipoReclutamiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoReclutamiento').setErrors(errors);
          }

          if ('salario' in error.errors) {
            const errors = {};
            error.errors.salario.forEach(element => {
              errors[element] = true;
            });
            this.form.get('salario').setErrors(errors);
          }

          if ('perfilPortalReclutamiento' in error.errors) {
            const errors = {};
            error.errors.perfilPortalReclutamiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('perfilPortalReclutamiento').setErrors(errors);
          }

          if ('salarioPortalReclutamiento' in error.errors) {
            const errors = {};
            error.errors.salarioPortalReclutamiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('salarioPortalReclutamiento').setErrors(errors);
          }

          if ('competenciaPortalReclutamiento' in error.errors) {
            const errors = {};
            error.errors.competenciaPortalReclutamiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('competenciaPortalReclutamiento').setErrors(errors);
          }

          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }

        }
      });
  }

  focusData(event): void {
    if (this.form.value.funcionario) {
      if (Number.isInteger(this.form.value.funcionario.id)) {
        this._service.getContratosFilter(this.form.value.funcionario.id).then((resp) => {

          let errors = {};
          if (resp['@odata.count'] > 0) {
            for (let x = 0; x < resp['@odata.count']; x++) {
              switch (resp.value[x].estado) {
                case 'SinIniciar':
                  errors = {};
                  errors['El funcionario que ingresaste tiene un contrato sin iniciar.'] = true;
                  this.form.get('funcionario').setErrors(errors);
                  break;
                case 'Suspendido':
                  errors = {};
                  errors['El funcionario que ingresaste tiene un contrato suspendido.'] = true;
                  this.form.get('funcionario').setErrors(errors);
                  break;
                default:
                  break;
              }
            }
          }
        });
      }
    }
  }

  validateDatosBasicos(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;
    //CA 03 HU061 V1
    if (value.id == null) {
      if (value.fechaInicio) {
        formGroup.get('fechaInicio').setErrors(null);
        const fechaInicios = moment(value.fechaInicio).toDate();
        const fechaActuales = new Date(new Date().setDate(new Date().getDate() - 1));

        if (fechaInicios.getTime() <= fechaActuales.getTime()) {
          const errors = {};
          errors['La fecha de inicio de la contratación no puede ser menor a la fecha actual.'] = true;
          formGroup.get('fechaInicio').setErrors(errors);
        }

        const actual = moment().toDate();
        actual.setHours(0);
        actual.setMinutes(0);
        actual.setSeconds(0);
        actual.setMilliseconds(0);
        const fechaIniciot = moment(value.fechaInicio).toDate();

        if (fechaIniciot.getTime() == actual.getTime()) {
          const errors = {};
          errors['La fecha de inicio de la contratación no puede ser igual a la fecha actual.'] = true;
          formGroup.get('fechaInicio').setErrors(errors);
        }
      }

      if (value.fechaInicio && value.fechaFin) {
        formGroup.get('fechaFin').setErrors(null);


        const fechaInicios = moment(value.fechaInicio).toDate();
        const fechaFines = moment(value.fechaFin).subtract(1, 'days').toDate();

        if (fechaInicios.getTime() > fechaFines.getTime()) {
          const errors = {};
          errors['La fecha final no puede ser menor a la fecha de inicio de la contratación.'] = true;
          formGroup.get('fechaFin').setErrors(errors);
        }

        const fechaInicio = moment(value.fechaInicio).toDate();
        const fechaFin = moment(value.fechaFin).toDate();
        if (fechaInicio.getTime() == fechaFin.getTime()) {
          const errores = {};
          errores['La fecha final no puede ser igual a la fecha de inicio de la contratación.'] = true;
          formGroup.get('fechaFin').setErrors(errores);
        }
      }


    }

    return null;
  }


  displayFnCentroDeCosto(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnCargoSolicitado(element: any): string {
    return element ? `${element.cargo.nombre}` : element;
  }

  displayFnFuncionarios(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  displayFnFuncionariosRemplaza(element: any): string {
    return element ? element.criterioBusqueda : element;
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

  private _cargos(dependenciaId): void {
    this._service.getCargo(dependenciaId).then(
      (response: any[]) => {
        this.cargoDependenciaSolicitante = response;
      }
    );
  }


  private _filterCentroCostos(value: any): any[] {
    return this.centroCostos.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }



  private _inArray(id: number, array: any[]): boolean {
    let dev = false;
    array.forEach(element => {
      if ('id' in element && element.id === id) {
        dev = true;
        return true;
      }
    });
    return dev;
  }
}
