import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent, MatSnackBar } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { fuseAnimations } from '@fuse/animations';
import { ContratosService } from './contratos-form.service';
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
import { MostrarOtrosiComponent } from '../mostrar-otrosi/mostrar-otrosi.component';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { FinalizarComponent } from '../finalizar/finalizar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
  selector: 'contratos-form',
  templateUrl: './contratos-form.component.html',
  styleUrls: ['./contratos-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ContratosFormComponent implements OnInit, AfterViewInit, AfterViewChecked {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  item: any;

  //
  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];
  funcionarios: any[];
  tipoContratos: any[];
  dependencias: Observable<any[]>;
  cargos: Observable<string[]>;
  cargosA: any[];
  grupos: any[];
  centroCostos: any[];
  // Lista todos los centros de trabajos requeridos para llenar el form
  centroTrabajos: any[];
  // Elige el contrato Centro trabajo especifico para el edit
  centroTrabajoSolo: any[];

  centroOperativos: any[];
  grupoNomina: any[];
  formaPagos: any[];
  tipoMonedas: any[];
  entidadFinancieras: any[];
  tipoPeriodo: any[];
  tipoCuentas: any[];
  jornadaLaborales: any[];
  desabilitar: boolean = false;
  id: number;
  ccf: any[];
  arl: any[];
  afp: any[];
  eps: any[];
  afc: any[];
  // version 5
  tipoCotizantes: any[];
  subTipocotizantes: any[];
  procedimientoRetencion: string = '';
  // Activación de validaciones -- getonchange -- guardar
  indefinido: boolean = false;
  fpagoactive: boolean = false;

  filteredFuncionarios: Observable<string[]>;
  filteredCentroCostos: Observable<string[]>;

  filteredFondoCesantias: Observable<string[]>;
  filteredEPS: Observable<string[]>;
  filteredAFP: Observable<string[]>;
  filteredCajaCompensacion: Observable<string[]>;

  otrosiDataRequest: boolean;
  displayedColumnsOtrosi: string[] = ['numero', 'fechaAplicacion', 'tipoContrato', 'fechaFinalizacion', 'cargo', 'acciones'];
  otrosiDataSource: OtrosiDataSource | null;
  environments: any;
  arrayPermisos: any;
  arrayPermisosOtroSi: any;
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
    private _service: ContratosService,
    private _matSnackBar: MatSnackBar,
    private _permisos: PermisosrService,
    private cdRef: ChangeDetectorRef
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Contratos_', null, null, 'Contratos_Finalizar')
    this.arrayPermisosOtroSi = this._permisos.permisosStorage('ContratoOtroSis_')
    this.submit = false;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    // this.cargos = [];
    // this.grupos = [];
    this.funcionarios = [];
    this.otrosiDataRequest = true;
    this.environments = environmentAlcanos;
    this._service.getPaises().then((resp) => {
      this.paises = resp;
      this._departamentos(resp[0].id, this.departamentosOrigen);
    });

    this.tipoContratos = this._service.onTipoContratosChanged.value;
    // this.dependencias = this._service.onDependenciasChanged.value;
    this.centroCostos = this._service.onCentroCostosChanged.value;
    this.formaPagos = this._service.onFormaPagosChanged.value;
    this.tipoMonedas = this._service.onTipoMonedasChanged.value;
    this.entidadFinancieras = this._service.onEntidadFinancierasChanged.value;
    this.tipoPeriodo = this._service.onTipoPeriodosChanged.value;
    this.tipoCuentas = this._service.onTipoCuentasChanged.value;
    this.jornadaLaborales = this._service.onJornadaLaboralesChanged.value;
    this.centroTrabajos = this._service.onCentroTrabajosChanged.value;
    this.centroOperativos = this._service.onCentroOperativosChanged.value;
    this.grupoNomina = this._service.onGrupoNominaChanged.value;
    this.centroTrabajoSolo = this._service.onCentroTrabajoSoloChanged.value;

    this.afc = this._service.onFondoCesantiasChanged.value;
    this.eps = this._service.onEPSChanged.value;
    this.afp = this._service.onAFPChanged.value;
    this.ccf = this._service.onCCFChanged.value;

    // v3
    // this.cargoGrupoId = this._service.onCargoGruposChanged.value;
    // version 5
    this.tipoCotizantes = this._service.onTipoCotizanteChanged.value;

    this.form = this._formBuilder.group({
      id: [null, []],
      funcionario: [null, [Validators.required]],
      tipoContratoId: [null, [Validators.required]],
      cargoId: [null, [Validators.required]],
      dependenciaId: [null, [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFinalizacion: [null, [Validators.required]],
      sueldo: [null, [Validators.required, Validators.max(9999999999999)]],
      centroOperativoId: [null, [Validators.required]],
      centroCosto: [null, [Validators.required]],
      formaPagoId: [null, [Validators.required]],
      tipoMonedaId: [null, [Validators.required]],
      entidadFinancieraId: [null, [Validators.required]],
      numeroCuenta: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(99999999999999999999)]],

      tipoCuentaId: [null, [Validators.required]],
      recibeDotacion: [null, [Validators.required]],
      periodoPrueba: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(0), Validators.max(100)]],
      jornadaLaboralId: [null, [Validators.required]],
      grupoNominaId: [null, [Validators.required]],
      empleadoConfianza: [null, [Validators.required]],
      centroTrabajoId: [null, [Validators.required]],
      fondoCesantias_val: [null, [Validators.required]],
      FechaFondoCesantias: [null, [Validators.required]],
      eps_val: [null, [Validators.required]],
      epsFecha: [null, [Validators.required]],
      afp_val: [null, [Validators.required]],
      afpFecha: [null, [Validators.required]],
      ccf_val: [null, [Validators.required]],
      observaciones: [null, [AlcanosValidators.maxLength(500)]],

      departamentoOrigenId: [null, [Validators.required]],
      municipioOrigenId: [null, [Validators.required]],
      procedimientoRetencion: ["1", [Validators.required]],
      // v3
      cargoGrupoId: [null, [Validators.required]],
      tipoPeriodoId: [null, [Validators.required]],
      // version 5
      tipoCotizanteId: [null, [Validators.required]],
      subTipoCotizanteId: [null, [Validators.required]],
      extranjeroNoObligadoACotizarAPension: [null, [Validators.required]],
      colombianoEnElExterior: [null, [Validators.required]],
    }, { validator: this.validateDatosBasicos });
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.desabilitar = true;
          let centroId = null;
          this.item = response;
          this.id = this.item.id;

          this._service.getGrupo(this.item.cargoGrupo.cargoId).then((resp) => {
            this.grupos = resp;
          });

          let departamentoOrigenId = null;
          const dependenciaId = null;
          const cargoId = null;

          if (this.item.divisionPoliticaNivel2Id != null && this.item.divisionPoliticaNivel2.divisionPoliticaNivel1 != null) {
            departamentoOrigenId = this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id;
          }

          let tipoCotizanteId = null;
          let subTipoCotizanteId = null;
          if (this.item.tipoCotizanteSubtipoCotizanteId != null && this.item.tipoCotizanteSubtipoCotizante != null) {
            tipoCotizanteId = this.item.tipoCotizanteSubtipoCotizante.tipoCotizanteId;
            subTipoCotizanteId = this.item.tipoCotizanteSubtipoCotizante.subtipoCotizanteId;
          }

          if (tipoCotizanteId !== null) {
            this.subTipocotizantes = [];
            this._subTipoCotizantes(tipoCotizanteId, this.subTipocotizantes);
          }

          if (this.item.procedimientoRetencion !== null) {
            this.procedimientoRetencion = this.item.procedimientoRetencion
          }
          if (this.item.contratoCentroTrabajos.length > 0) {
            centroId = this.item.contratoCentroTrabajos.filter(i => i.fechaFin === null)[0].centroTrabajoId;
          }

          this.form.patchValue({
            id: this.item.id,
            departamentoOrigenId: this.item.divisionPoliticaNivel2.divisionPoliticaNivel1Id,
            municipioOrigenId: this.item.divisionPoliticaNivel2Id,
            funcionario: this.item.funcionario,
            tipoContratoId: this.item.tipoContratoId,
            cargoId: this.item.cargoDependencia.cargoId,
            dependenciaId: this.item.cargoDependencia.dependenciaId,
            fechaInicio: this.item.fechaInicio, //moment(this.item.fechaInicio).format('DD/MM/YYYY'),
            fechaFinalizacion: this.item.fechaFinalizacion, //moment(this.item.fechaFinalizacion).format('DD/MM/YYYY'),
            sueldo: String(this.item.sueldo).replace('.', ','),
            centroOperativoId: this.item.centroOperativoId,
            centroCosto: this.item.centroCosto,
            formaPagoId: this.item.formaPagoId,
            tipoMonedaId: this.item.tipoMonedaId,
            entidadFinancieraId: this.item.entidadFinancieraId,
            tipoCuentaId: this.item.tipoCuentaId,
            numeroCuenta: this.item.numeroCuenta,
            recibeDotacion: this.item.recibeDotacion,
            periodoPrueba: this.item.periodoPrueba,
            jornadaLaboralId: this.item.jornadaLaboralId,
            grupoNominaId: this.item.grupoNominaId,
            empleadoConfianza: this.item.empleadoConfianza,
            // procedimientoRetencionn: (this.item.procedimientoRetencion == 'Procedimiento1') ? '1' : '2',
            centroTrabajoId: centroId,
            fondoCesantias: this.item.fondoCesantias,
            FechaFondoCesantias: this.item.FechaFondoCesantias,
            eps_val: this.item.contratoAdministradoras.administradoraId,
            epsFecha: this.item.fechaInicio,
            // afp: this.item.afp,
            afpFecha: this.item.afpFecha,
            ccf_val: this.item.ccf,
            observaciones: this.item.observaciones || null,
            // version 3
            tipoPeriodoId: this.item.tipoPeriodoId,
            cargoGrupoId: this.item.cargoGrupoId,
            // version 5
            tipoCotizanteId: tipoCotizanteId,
            subTipoCotizanteId: subTipoCotizanteId,
            extranjeroNoObligadoACotizarAPension: this.item.extranjeroNoObligadoACotizarAPension ? 'true' : 'false',
            colombianoEnElExterior: this.item.colombianoEnElExterior ? 'true' : 'false',

          });

          this.form.markAllAsTouched();

          if (this.item.tipoContrato.terminoIndefinido === true) {
            this.form.get('fechaFinalizacion').setValue(null);
          }

          // Desabilitar campos en el editar
          this.form.get('funcionario').disable();
          this.form.get('tipoContratoId').disable();
          this.form.get('dependenciaId').disable();
          this.form.get('cargoId').disable();
          this.form.get('fechaInicio').disable();
          this.form.get('fechaFinalizacion').disable();
          this.form.get('sueldo').disable();
          this.form.get('cargoGrupoId').disable();
          this.form.get('centroOperativoId').disable();
          this.form.get('departamentoOrigenId').disable();
          this.form.get('municipioOrigenId').disable();
          this.form.get('FechaFondoCesantias').disable();
          this.form.get('eps_val').disable();
          this.form.get('epsFecha').disable();
          this.form.get('afp_val').disable();
          this.form.get('afpFecha').disable();
          this.form.get('ccf_val').disable();
          this.form.get('fondoCesantias_val').disable();
          this.form.get('centroTrabajoId').disable();

          if (!this.item.formaPago.habilitaEntidadFinanciera) {
            this.form.get('entidadFinancieraId').disable();
            this.form.get('tipoCuentaId').disable();
            this.form.get('numeroCuenta').disable();
          }

          if (departamentoOrigenId !== null) {
            this._municipios(departamentoOrigenId, this.municipiosOrigen);
          }

          if (dependenciaId !== null) {
            this._cargos(dependenciaId);
          }

          if (cargoId !== null) {
            this._grupos(cargoId);
          }
        }
      }
    );

    this._service.otrosiDataRequest.subscribe(resp => { this.otrosiDataRequest = resp });
    this.otrosiDataSource = new OtrosiDataSource(this._service);

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('municipioOrigenId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );

    this.form.get('dependenciaId').valueChanges.subscribe(
      (value) => {
        // this.cargos = null
        this.form.get('cargoId').setValue('')
        this.cargos = null
        if (value.id != null) {
          this._cargos(value.id);
        }
      }
    );

    this.form.get('cargoId').valueChanges.subscribe(
      (value) => {
        if (value != null) {
          this._grupos(value.id);
        }
      }
    );

    this.form.get('tipoContratoId').valueChanges.subscribe(
      (value) => {
        let accept = false;
        let num = null;
        this.tipoContratos.map((resp) => {
          if (value == resp.id && resp.terminoIndefinido == true) {
            accept = resp.terminoIndefinido;
            num = resp.id;
          }
        });
        this.form.get('fechaFinalizacion').enable();
        this.indefinido = false;
        if (value === num && accept) {
          this.form.get('fechaFinalizacion').disable();
          this.indefinido = true;
        }
      }
    );

    this.form.get('formaPagoId').valueChanges.subscribe(
      (value) => {

        this.formaPagos.map((resp) => {
          if (value == resp.id) {
            if (resp.habilitaEntidadFinanciera) {
              this.fpagoactive = false;
            } else {
              this.fpagoactive = true;
            }
          }
        });
        if (this.fpagoactive) {
          this.form.get('entidadFinancieraId').disable();
          this.form.get('tipoCuentaId').disable();
          this.form.get('numeroCuenta').disable();
        } else {
          this.form.get('entidadFinancieraId').enable();
          this.form.get('tipoCuentaId').enable();
          this.form.get('numeroCuenta').enable();
        }
      }
    );

    this.form.get('fechaInicio').valueChanges.subscribe(
      (value) => {
        this.form.patchValue({
          FechaFondoCesantias: '',
          epsFecha: '',
          afpFecha: '',
        });
        let fecha = value;
        if (typeof fecha === 'string') {
          fecha = moment(fecha).toDate();
        } else {
          fecha = value.toDate();
        }
        this.form.patchValue({
          FechaFondoCesantias: fecha,
          epsFecha: fecha,
          afpFecha: fecha,
        });

      }
    );

    // version 5
    this.form.get('tipoCotizanteId').valueChanges.subscribe(
      (value) => {
        this.subTipocotizantes = [];
        this.form.get('subTipoCotizanteId').setValue(null);
        if (value != null) {
          this._subTipoCotizantes(value, this.subTipocotizantes);
        }

      }
    );

    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );


    this.filteredCentroCostos = this.form.get('centroCosto')
      .valueChanges.pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.autocomplete)),
        map(view => (view ? this._filterCentroCostos(view) : this.centroCostos.slice())
        ),
      );

    this.dependencias = this.form.get('dependenciaId')
      .valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.autocomplete)),
        map(view => (view ? this._filterDependencias(view) : this._service.onDependenciasChanged.value.slice())
        ),
      );

    this.filteredFondoCesantias = this.form.get('fondoCesantias_val').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredFondoCesantias(view) : this.afc.slice())
        ),
      );

    this.filteredEPS = this.form.get('eps_val').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredEPS(view) : this.eps.slice())
        ),
      );

    this.filteredAFP = this.form.get('afp_val').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredAFP(view) : this.afp.slice())
        ),
      );

    this.filteredCajaCompensacion = this.form.get('ccf_val').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filteredCajaCompensacion(view) : this.ccf.slice())
        ),
      );


  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  urlDocument(d: number): void {
    this._service.getFile(this.item.funcionarioId).subscribe(data => {
      var blob = new Blob([data], { type: 'application/pdf' });
      var url = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      const actual = moment().toDate();
      link.download = 'CONTRATO' + this.item.id + '_' + actual.getFullYear() + (actual.getMonth() + 1) + actual.getDate();
      link.click();
    }, error => {
      this._matSnackBar.open('El tipo de contrato no tiene una plantilla asignada.', 'Aceptar', {
        verticalPosition: 'top',
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    })
  }

  registrarOtrosi(item): void {
    if (item.estadoContrato != 'SinIniciar') {
      this._router.navigate([`/administracion-personal/contratos/${item.funcionarioId}/crear-otrosi`]);
    } else {
      this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: 'No se puede crear un otrosí ya que el contrato se encuentra en estado "Sin iniciar".', time: 6000 });
    }
  }

  get hasOtrosiDataSource(): boolean {
    return this._service.onOtrosiChanged.value != null && this._service.onOtrosiChanged.value.length > 0;
  }

  mostrarOtrosiHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarOtrosiComponent, {
      panelClass: 'mostrar-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  eliminarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarHandle(element.id).then(() => {
          this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['exito-snackbar'],
          });

          this._service.refreshOtrosi();
        }, error => {
          this._matSnackBar.open(error.error.message, 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['advertencia-snackbar'],
          });
        });
      }
    });
  }

  finalizarContratoHandle(event): void {
    const dialogRef = this._matDialog.open(FinalizarComponent, {
      panelClass: 'modal-dialog',
      disableClose: true,
      data: { id: this._service.id },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.refreshContrato();
      }
    });
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    let final = null;
    if (formValue.cargoId) {
      formValue.cargoDependenciaId = formValue.cargoId.id;
    }

    if (formValue.id == null) {
      formValue.funcionarioId = formValue.funcionario.id;
      formValue.dependenciaId = formValue.dependenciaId.id;

      // formValue.funcionario = null;
      formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
      if (!this.indefinido) {
        formValue.fechaFinalizacion = moment(formValue.fechaFinalizacion).format('YYYY-MM-DDTHH:mm:ssZ');
        final = moment(formValue.fechaFinalizacion).format('YYYY-MM-DDTHH:mm:ssZ');
      } else {
        // formValue.fechaFinalizacion = null;
        // final = null;
      }
      formValue.tipoContratoId = formValue.tipoContratoId;
      formValue.cargoId = formValue.cargoId.id;
      formValue.sueldo = String(formValue.sueldo).replace('.', ',');
      formValue.cargoGrupoId = formValue.cargoGrupoId;
      formValue.centroOperativoId = formValue.centroOperativoId;
      formValue.divisionPoliticaNivel2Id = formValue.municipioOrigenId;
    } else {
      formValue.sueldo = String(this.item.sueldo).replace('.', ',');
      formValue.cargoGrupoId = this.item.cargoGrupoId;
      formValue.cargoId = this.item.cargoId;
      formValue.tipoContratoId = this.item.tipoContratoId;
      formValue.fechaInicio = this.item.fechaInicio;
      formValue.fechaFinalizacion = this.item.fechaFinalizacion;
      formValue.funcionarioId = this.item.funcionarioId;
      formValue.centroOperativoId = this.item.centroOperativoId;
      formValue.divisionPoliticaNivel2Id = this.item.divisionPoliticaNivel2Id;
    }

    formValue.recibeDotacion = Boolean(formValue.recibeDotacion);
    formValue.empleadoConfianza = Boolean(formValue.empleadoConfianza);
    formValue.centroCostoId = formValue.centroCosto.id;
    // formValue.centroCosto = null;

    formValue.formaPagoId = formValue.formaPagoId;
    formValue.tipoMonedaId = formValue.tipoMonedaId;

    if (!this.fpagoactive) {
      formValue.entidadFinancieraId = formValue.entidadFinancieraId;
      formValue.tipoCuentaId = formValue.tipoCuentaId;
      formValue.numeroCuenta = formValue.numeroCuenta;
    } else {
      // formValue.entidadFinancieraId = null;
      // formValue.tipoCuentaId = null;
      // formValue.numeroCuenta = null;
    }

    formValue.jornadaLaboralId = formValue.jornadaLaboralId;
    // formValue.procedimientoRetencion = formValue.procedimientoRetencionn;
    formValue.centroTrabajoId = formValue.centroTrabajoId;

    if (formValue.id == null) {
      formValue.Afp = formValue.afp_val.id;
      formValue.AfpFechaInicio = moment(formValue.afpFecha).format('YYYY-MM-DDTHH:mm:ssZ');
      formValue.FondoCesantias = formValue.fondoCesantias_val.id;
      formValue.FondoCesantiasFechaInicio = moment(formValue.FechaFondoCesantias).format('YYYY-MM-DDTHH:mm:ssZ');
      formValue.CajaCompensacion = formValue.ccf_val.id;
      formValue.CajaCompensacionFechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
      formValue.Eps = formValue.eps_val.id;
      formValue.EpsFechaInicio = moment(formValue.epsFecha).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    // Object.keys(this.form.controls).forEach(key => {
    //   console.log(`${key} es valido : ${this.form.get(key).valid}`);
    //   console.log(this.form.get(key).errors);
    // });

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/administracion-personal/contratos/${resp.id}/mostrar`]);
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
          if ('municipioOrigenId' in error.errors) {
            const errors = {};
            error.errors.municipioOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('municipioOrigenId').setErrors(errors);
          }

          if ('paisOrigenId' in error.errors) {
            const errors = {};
            error.errors.paisOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('paisOrigenId').setErrors(errors);
          }

          if ('departamentoOrigenId' in error.errors) {
            const errors = {};
            error.errors.departamentoOrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('departamentoOrigenId').setErrors(errors);
          }

          if ('funcionarioId' in error.errors) {
            const errors = {};
            error.errors.funcionarioId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }

          if ('tipoContratoId' in error.errors) {
            const errors = {};
            error.errors.tipoContratoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoContratoId').setErrors(errors);
          }

          if ('cargoId' in error.errors) {
            const errors = {};
            error.errors.cargoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cargoId').setErrors(errors);
          }
          if ('dependenciaId' in error.errors) {

            const errors = {};
            error.errors.dependenciaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('dependenciaId').setErrors(errors);
          }

          if ('fechaInicio' in error.errors) {
            const errors = {};
            error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }

          if ('fechaFinalizacion' in error.errors) {
            const errors = {};
            error.errors.fechaFinalizacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFinalizacion').setErrors(errors);
          }

          if ('sueldo' in error.errors) {
            const errors = {};
            error.errors.sueldo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('sueldo').setErrors(errors);
          }

          if ('cargoGrupoId' in error.errors) {
            const errors = {};
            error.errors.cargoGrupoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cargoGrupoId').setErrors(errors);
          }

          if ('tipoPeriodoId' in error.errors) {
            const errors = {};
            error.errors.tipoPeriodoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoPeriodoId').setErrors(errors);
          }

          if ('centroOperativoId' in error.errors) {
            const errors = {};
            error.errors.centroOperativoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroOperativoId').setErrors(errors);
          }

          if ('centroCosto' in error.errors) {
            const errors = {};
            error.errors.centroCosto.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroCosto').setErrors(errors);
          }

          if ('formaPagoId' in error.errors) {
            const errors = {};
            error.errors.formaPagoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('formaPagoId').setErrors(errors);
          }

          if ('tipoMonedaId' in error.errors) {
            const errors = {};
            error.errors.tipoMonedaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoMonedaId').setErrors(errors);
          }

          if ('entidadFinancieraId' in error.errors) {
            const errors = {};
            error.errors.entidadFinancieraId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('entidadFinancieraId').setErrors(errors);
          }

          if ('tipoCuentaId' in error.errors) {
            const errors = {};
            error.errors.tipoCuentaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoCuentaId').setErrors(errors);
          }

          if ('numeroCuenta' in error.errors) {
            const errors = {};
            error.errors.numeroCuenta.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroCuenta').setErrors(errors);
          }

          if ('recibeDotacion' in error.errors) {
            const errors = {};
            error.errors.recibeDotacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('recibeDotacion').setErrors(errors);
          }

          if ('periodoPrueba' in error.errors) {
            const errors = {};
            error.errors.periodoPrueba.forEach(element => {
              errors[element] = true;
            });
            this.form.get('periodoPrueba').setErrors(errors);
          }

          if ('jornadaLaboralId' in error.errors) {
            const errors = {};
            error.errors.jornadaLaboralId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('jornadaLaboralId').setErrors(errors);
          }

          if ('grupoNominaId' in error.errors) {
            const errors = {};
            error.errors.grupoNominaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('grupoNominaId').setErrors(errors);
          }

          if ('empleadoConfianza' in error.errors) {
            const errors = {};
            error.errors.empleadoConfianza.forEach(element => {
              errors[element] = true;
            });
            this.form.get('empleadoConfianza').setErrors(errors);
          }

          // if ('procedimientoRetencionn' in error.errors) {
          //   const errors = {};
          //   error.errors.procedimientoRetencionn.forEach(element => {
          //     errors[element] = true;
          //   });
          //   this.form.get('procedimientoRetencionn').setErrors(errors);
          // }

          if ('centroTrabajoId' in error.errors) {
            const errors = {};
            error.errors.centroTrabajoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('centroTrabajoId').setErrors(errors);
          }

          if ('fondoCesantias' in error.errors) {
            const errors = {};
            error.errors.fondoCesantias.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fondoCesantias_val').setErrors(errors);
          }

          if ('FechaFondoCesantias' in error.errors) {
            const errors = {};
            error.errors.FechaFondoCesantias.forEach(element => {
              errors[element] = true;
            });
            this.form.get('FechaFondoCesantias').setErrors(errors);
          }

          if ('eps' in error.errors) {
            const errors = {};
            error.errors.eps.forEach(element => {
              errors[element] = true;
            });
            this.form.get('eps_val').setErrors(errors);
          }

          if ('epsFecha' in error.errors) {
            const errors = {};
            error.errors.epsFecha.forEach(element => {
              errors[element] = true;
            });
            this.form.get('epsFecha').setErrors(errors);
          }

          if ('afp' in error.errors) {
            const errors = {};
            error.errors.afp.forEach(element => {
              errors[element] = true;
            });
            this.form.get('afp_val').setErrors(errors);
          }

          if ('afpFecha' in error.errors) {
            const errors = {};
            error.errors.afpFecha.forEach(element => {
              errors[element] = true;
            });
            this.form.get('afpFecha').setErrors(errors);
          }

          if ('ccf' in error.errors) {
            const errors = {};
            error.errors.ccf.forEach(element => {
              errors[element] = true;
            });
            this.form.get('ccf_val').setErrors(errors);
          }

          if ('tipoCotizanteId' in error.errors) {
            const errors = {};
            error.errors.tipoCotizanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoCotizanteId').setErrors(errors);
          }

          if ('subTipoCotizanteId' in error.errors) {
            const errors = {};
            error.errors.subTipoCotizanteId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('subTipoCotizanteId').setErrors(errors);
          }

          if ('extranjeroNoObligadoACotizarAPension' in error.errors) {
            const errors = {};
            error.errors.extranjeroNoObligadoACotizarAPension.forEach(element => {
              errors[element] = true;
            });
            this.form.get('extranjeroNoObligadoACotizarAPension').setErrors(errors);
          }

          if ('colombianoEnElExterior' in error.errors) {
            const errors = {};
            error.errors.colombianoEnElExterior.forEach(element => {
              errors[element] = true;
            });
            this.form.get('colombianoEnElExterior').setErrors(errors);
          }

          if ('observaciones' in error.errors) {
            const errors = {};
            error.errors.observaciones.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observaciones').setErrors(errors);
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
                case 'Vigente':
                  errors = {};
                  errors['El funcionario que ingresaste tiene un contrato vigente.'] = true;
                  this.form.get('funcionario').setErrors(errors);
                  break;
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

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateDatosBasicos(formGroup: FormGroup): any {
    const value = formGroup.value;
    if (value.id == null) {
      if (value.fechaFinalizacion != null) {
        let fechaIn = value.fechaInicio;
        let fechaOut = value.fechaFinalizacion;

        if (typeof fechaIn === 'string') {
          fechaIn = moment(fechaIn).toDate();
        } else {
          fechaIn = value.fechaInicio.toDate();
        }

        if (typeof fechaOut === 'string') {
          fechaOut = moment(fechaOut).toDate();
        } else {
          fechaOut = value.fechaFinalizacion.toDate();
        }

        if (fechaOut.getTime() < fechaIn.getTime()) {
          const errors = {};
          errors['La fecha de finalización que ingresaste no puede ser menor que la fecha de inicio del contrato.'] = true;
          formGroup.get('fechaFinalizacion').setErrors(errors);
        }

      }
      if (value.fechaInicio != null) {
        let fecha = value.fechaInicio;
        if (typeof fecha === 'string') {
          fecha = moment(fecha).toDate();
        } else {
          fecha = value.fechaInicio.toDate();
        }
        const hoyMenos3 = new Date(new Date().setDate(new Date().getDate() - 4));
        const hoyMas5 = new Date(new Date().setDate(new Date().getDate() + 5));

        /// Solicitud bloqueda por analista y qa para efecto de cargue masivo de contenidos a espera de modificación
        // if (!(fecha.getTime() > hoyMenos3.getTime())) {
        //   const errors = {};
        //   errors['La fecha de inicio que ingresaste no puede ser menor a 3 días que la fecha actual.'] = true;
        //   formGroup.get('fechaInicio').setErrors(errors);
        // }

        // if (!(fecha.getTime() < hoyMas5.getTime())) {
        //   const errors = {};
        //   errors['La fecha de inicio que ingresaste no puede ser mayor a 5 días que la fecha actual.'] = true;
        //   formGroup.get('fechaInicio').setErrors(errors);
        // }
      }
    }
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnFuncionarios(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  displayFnDependencias(element: any): string {
    return element ? element.autocomplete : element;
  }

  displayFnCargos(element: any): string {
    return element ? element.autocomplete : element;
  }

  displayFnCostos(element: any): string {
    return element ? element.autocomplete : element;
  }

  //* Administradoras ----

  displayFnFondoCesantias(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnEPS(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnAFP(element: any): string {
    return element ? element.nombre : element;
  }

  displayFnCCF(element: any): string {
    return element ? element.nombre : element;
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
        this.cargosA = response;
        this.cargos = this.form.get('cargoId')
          .valueChanges
          .pipe(
            startWith<string | any>(''),
            map(val => (typeof val === 'string' ? val : val.autocomplete)),
            map(view => (view ? this._filterCargos(view) : response.slice())
            ),
          );
      }
    );
  }

  private _findCargoByCargoDependencia(cargoDependenciaId) {
    let cargoId = null;
    if (this.cargosA && this.cargosA.length > 0) {
      this.cargosA.forEach(element => {
        if (element.id == cargoDependenciaId) {
          cargoId = element.cargoId;
          return;
        }
      });
    }
    return cargoId;
  }

  // v3
  private _grupos(cargoDependenciaId): void {
    const cargoId = this._findCargoByCargoDependencia(cargoDependenciaId);
    if (cargoId) {
      this._service.getGrupo(cargoId).then(
        (response: any[]) => {
          this.grupos = response;
        }
      );
    } else {
      this.grupos = [];
    }

  }

  // version 5
  private _subTipoCotizantes(subTipoCotizanteId, array: any[]): void {
    this._service.getSubTipoCotizantes(subTipoCotizanteId).then(
      (response: any[]) => {
        response.forEach(element => {
          array.push(element);
        });
      }
    );
  }

  //**  Bloque de Administradoras 
  private _filteredFondoCesantias(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.afc.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }

  private _filteredEPS(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.eps.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }

  private _filteredAFP(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.afp.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }

  private _filteredCajaCompensacion(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.ccf.filter(option => this._normalizeValue(option.nombre).includes(filterValue));
  }


  //** Cierre bloque administradoras */

  private _filterCentroCostos(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.centroCostos.filter(option => this._normalizeValue(option.autocomplete).includes(filterValue));
  }

  private _filterDependencias(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this._service.onDependenciasChanged.value.filter(option => this._normalizeValue(option.autocomplete).includes(filterValue));
  }

  private _filterCargos(value: any): any[] {
    const filterValue = this._normalizeValue(value);
    return this.cargosA.filter(option => this._normalizeValue(option.autocomplete).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
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

export class OtrosiDataSource extends DataSource<any>{

  constructor(
    private _service: ContratosService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onOtrosiChanged,

    ];
    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onOtrosiChanged.value.slice();
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}