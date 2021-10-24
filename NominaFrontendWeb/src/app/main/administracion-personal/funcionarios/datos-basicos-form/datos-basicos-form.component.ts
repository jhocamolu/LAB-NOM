import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { DatosBasicosService } from './datos-basicos-form.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearRetefuenteComponent } from '../crear-retefuente/crear-retefuente.component';
import { MostrarService } from '../mostrar/mostrar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { SharedServiceProf } from '@alcanos/services/shared.service';

@Component({
  selector: 'funcionarios-datos-basicos-form',
  templateUrl: './datos-basicos-form.component.html',
  styleUrls: ['./datos-basicos-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class DatosBasicosFormComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  item: any;

  //
  generos: any[];
  estadoCiviles: any[];
  ocupaciones: any[];
  paises: any[];
  departamentosOrigen: any[];
  municipiosOrigen: any[];
  departamentosExpedicionDocumento: any[];
  municipiosExpedicionDocumento: any[];
  departamentosResidencia: any[];
  municipiosResidencia: any[];
  tipoDocumentos: any[];
  tipoViviendas: any[];
  claseLibretaMilitares: any[];
  licenciasA: any[];
  licenciasB: any[];
  licenciasC: any[];
  tipoSangres: any[];

  filteredOcupaciones: Observable<string[]>;
  // tslint:disable-next-line: no-input-rename
  @Input('funcionarioId') id: any;
  arrayPermisos: any;
  arrayPermisosInformacionFamiliares: any;
  arrayPermisosFuncionarioEstudios: any;
  arrayPermisosExperienciaLaborales: any;
  arrayPermisosDocumentoFuncionarios: any;
  arrayPermisosDeduccionRetefuentes: any;
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
    private _service: DatosBasicosService,
    private _service2: MostrarService,
    private _permisos: PermisosrService,
    private sharedService: SharedServiceProf,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Funcionarios_');
    this.arrayPermisosInformacionFamiliares = this._permisos.permisosStorage('InformacionFamiliares_');
    this.arrayPermisosFuncionarioEstudios = this._permisos.permisosStorage('FuncionarioEstudios_');
    this.arrayPermisosExperienciaLaborales = this._permisos.permisosStorage('ExperienciaLaborales_');
    this.arrayPermisosDocumentoFuncionarios = this._permisos.permisosStorage('DocumentoFuncionarios_');
    this.arrayPermisosDeduccionRetefuentes = this._permisos.permisosStorage('DeduccionRetefuentes_');
    this.submit = false;
    this.generos = this._service.onGenerosChanged.value;
    this.estadoCiviles = this._service.onEstadoCivilesChanged.value;
    this.ocupaciones = this._service.onOcupacionesChanged.value;
    this.paises = this._service.onPaisesChanged.value;
    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    this.departamentosExpedicionDocumento = [];
    this.municipiosExpedicionDocumento = [];
    this.departamentosResidencia = [];
    this.municipiosResidencia = [];
    this.tipoDocumentos = this._service.onTipoDocumentosChanged.value;
    this.tipoViviendas = this._service.onTipoViviendasChanged.value;
    this.claseLibretaMilitares = this._service.onClaseLibretaMilitaresChanged.value;
    this.licenciasA = this._service.onLicenciasAChanged.value;
    this.licenciasB = this._service.onLicenciasBChanged.value;
    this.licenciasC = this._service.onLicenciasCChanged.value;
    this.tipoSangres = this._service.onTipoSangresChanged.value;
    this.form = this._formBuilder.group({
      id: [null],
      primerNombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoNombre: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      primerApellido: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      segundoApellido: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      sexoId: [null, [Validators.required]],
      estadoCivilId: [null, [Validators.required]],
      ocupacion: [null, [Validators.required]],
      pensionado: [null, [Validators.required]],
      fechaNacimiento: [null, [Validators.required]],
      paisOrigenId: [null, [Validators.required]],
      departamentoOrigenId: [null, [Validators.required]],
      divisionPoliticaNivel2OrigenId: [null, [Validators.required]],
      tipoDocumentoId: [null, [Validators.required]],
      numeroDocumento: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(15)]],
      fechaExpedicionDocumento: [null, [Validators.required]],
      paisExpedicionDocumentoId: [null, [Validators.required]],
      departamentoExpedicionDocumentoId: [null, [Validators.required]],
      divisionPoliticaNivel2ExpedicionDocumentoId: [null, [Validators.required]],
      nit: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(15)]],
      digitoVerificacion: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(1)]],
      paisResidenciaId: [null, [Validators.required]],
      departamentoResidenciaId: [null, [Validators.required]],
      divisionPoliticaNivel2ResidenciaId: [null, [Validators.required]],
      celular: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1000000000), Validators.max(999999999999)]],
      telefonoFijo: [null, [AlcanosValidators.numerico, Validators.min(1000000), Validators.max(9999999999)]],
      tipoViviendaId: [null, [Validators.required]],
      direccion: [null, [Validators.required, AlcanosValidators.direccion]],
      claseLibretaMilitarId: [null, []],
      numeroLibreta: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(15)]],
      distrito: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(3)]],
      licenciaConduccionAId: [null, []],
      licenciaConduccionBId: [null, []],
      licenciaConduccionCId: [null, []],
      licenciaConduccionAFechaVencimiento: [null, []],
      licenciaConduccionBFechaVencimiento: [null, []],
      licenciaConduccionCFechaVencimiento: [null, []],
      tallaCamisa: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(3)]],
      tallaPantalon: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(2)]],
      numeroCalzado: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(2)]],
      usaLentes: [null, [Validators.required]],
      tipoSangreId: [null, [Validators.required]],
      correoElectronicoPersonal: [null, [AlcanosValidators.correoElectronico]],
      correoElectronicoCorporativo: [null, [AlcanosValidators.correoElectronico]],
    }, { validator: this.validateDatosBasicos });

  }


  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.item = response;

          let paisOrigenId = null;
          let departamentoOrigenId = null;
          let paisExpedicionDocumentoId = null;
          let departamentoExpedicionDocumentoId = null;
          let paisResidenciaId = null;
          let departamentoResidenciaId = null;

          const sexoId = this._inArray(this.item.sexoId, this.generos) ? this.item.sexoId : null;
          const estadoCivilId = this._inArray(this.item.estadoCivilId, this.estadoCiviles) ? this.item.estadoCivilId : null;
          const tipoDocumentoId = this._inArray(this.item.tipoDocumentoId, this.tipoDocumentos) ? this.item.tipoDocumentoId : null;

          if (this.item.divisionPoliticaNivel2Origen != null && this.item.divisionPoliticaNivel2Origen.divisionPoliticaNivel1 != null) {
            // tslint:disable-next-line: max-line-length
            paisOrigenId = this._inArray(this.item.divisionPoliticaNivel2Origen.divisionPoliticaNivel1.paisId, this.paises) ? this.item.divisionPoliticaNivel2Origen.divisionPoliticaNivel1.paisId : null;
            departamentoOrigenId = this.item.divisionPoliticaNivel2Origen.divisionPoliticaNivel1Id;
          }

          if (this.item.divisionPoliticaNivel2ExpedicionDocumento != null && this.item.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1 != null) {
            // tslint:disable-next-line: max-line-length
            paisExpedicionDocumentoId = this._inArray(this.item.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1.paisId, this.paises) ? this.item.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1.paisId : null;
            departamentoExpedicionDocumentoId = this.item.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1Id;
          }

          if (this.item.divisionPoliticaNivel2Residencia != null && this.item.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1 != null) {
            // tslint:disable-next-line: max-line-length
            paisResidenciaId = this._inArray(this.item.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1.paisId, this.paises) ? this.item.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1.paisId : null;
            departamentoResidenciaId = this.item.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1Id;
          }



          this.form.patchValue({
            id: this.item.id,
            primerNombre: this.item.primerNombre,
            segundoNombre: this.item.segundoNombre,
            primerApellido: this.item.primerApellido,
            segundoApellido: this.item.segundoApellido,
            sexoId: sexoId,
            estadoCivilId: estadoCivilId,
            ocupacion: this.item.ocupacion,
            pensionado: this.item.pensionado,
            estadoEmpleadoId: this.item.estadoEmpleadoId,
            fechaNacimiento: this.item.fechaNacimiento,
            paisOrigenId: paisOrigenId,
            departamentoOrigenId: departamentoOrigenId,
            divisionPoliticaNivel2OrigenId: this.item.divisionPoliticaNivel2OrigenId,
            tipoDocumentoId: tipoDocumentoId,
            numeroDocumento: this.item.numeroDocumento,
            fechaExpedicionDocumento: this.item.fechaExpedicionDocumento,
            paisExpedicionDocumentoId: paisExpedicionDocumentoId,
            departamentoExpedicionDocumentoId: departamentoExpedicionDocumentoId,
            divisionPoliticaNivel2ExpedicionDocumentoId: this.item.divisionPoliticaNivel2ExpedicionDocumentoId,
            nit: this.item.nit,
            digitoVerificacion: this.item.digitoVerificacion,
            paisResidenciaId: paisResidenciaId,
            departamentoResidenciaId: departamentoResidenciaId,
            divisionPoliticaNivel2ResidenciaId: this.item.divisionPoliticaNivel2ResidenciaId,
            celular: this.item.celular,
            telefonoFijo: this.item.telefonoFijo,
            tipoViviendaId: this.item.tipoViviendaId,
            direccion: this.item.direccion,
            claseLibretaMilitarId: this.item.claseLibretaMilitarId,
            numeroLibreta: this.item.numeroLibreta,
            distrito: this.item.distrito,
            licenciaConduccionAId: this.item.licenciaConduccionAId,
            licenciaConduccionBId: this.item.licenciaConduccionBId,
            licenciaConduccionCId: this.item.licenciaConduccionCId,
            licenciaConduccionAFechaVencimiento: this.item.licenciaConduccionAFechaVencimiento,
            licenciaConduccionBFechaVencimiento: this.item.licenciaConduccionBFechaVencimiento,
            licenciaConduccionCFechaVencimiento: this.item.licenciaConduccionCFechaVencimiento,
            tallaCamisa: this.item.tallaCamisa,
            tallaPantalon: this.item.tallaPantalon,
            numeroCalzado: this.item.numeroCalzado,
            usaLentes: this.item.usaLentes,
            tipoSangreId: this.item.tipoSangreId,
            correoElectronicoPersonal: this.item.correoElectronicoPersonal,
            correoElectronicoCorporativo: this.item.correoElectronicoCorporativo,
          });

          this.form.markAllAsTouched();

          if (paisOrigenId !== null) {
            this._departamentos(paisOrigenId, this.departamentosOrigen);
          }

          if (departamentoOrigenId !== null) {
            this._municipios(departamentoOrigenId, this.municipiosOrigen);
          }

          if (paisExpedicionDocumentoId !== null) {
            this._departamentos(paisExpedicionDocumentoId, this.departamentosExpedicionDocumento);
          }

          if (departamentoExpedicionDocumentoId !== null) {
            this._municipios(departamentoExpedicionDocumentoId, this.municipiosExpedicionDocumento);
          }

          if (paisResidenciaId !== null) {
            this._departamentos(paisResidenciaId, this.departamentosResidencia);
          }

          if (departamentoResidenciaId !== null) {
            this._municipios(departamentoResidenciaId, this.municipiosResidencia);
          }
        }
      }
    );

    this.filteredOcupaciones = this.form.get('ocupacion')
      .valueChanges.pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filterOcupaciones(view) : this.ocupaciones.slice())
        ),
      );

    this.form.get('paisOrigenId').valueChanges.subscribe(
      (value) => {
        this.departamentosOrigen = [];
        this.municipiosOrigen = [];
        this.form.get('departamentoOrigenId').setValue(null);
        this.form.get('divisionPoliticaNivel2OrigenId').setValue(null);
        if (value != null) {
          this._departamentos(value, this.departamentosOrigen);
        }
      }
    );

    this.form.get('departamentoOrigenId').valueChanges.subscribe(
      (value) => {
        this.municipiosOrigen = [];
        this.form.get('divisionPoliticaNivel2OrigenId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosOrigen);
        }
      }
    );

    this.form.get('paisExpedicionDocumentoId').valueChanges.subscribe(
      (value) => {
        this.departamentosExpedicionDocumento = [];
        this.municipiosExpedicionDocumento = [];
        this.form.get('departamentoExpedicionDocumentoId').setValue(null);
        this.form.get('divisionPoliticaNivel2ExpedicionDocumentoId').setValue(null);
        if (value != null) {
          this._departamentos(value, this.departamentosExpedicionDocumento);
        }
      }
    );

    this.form.get('departamentoExpedicionDocumentoId').valueChanges.subscribe(
      (value) => {
        this.municipiosExpedicionDocumento = [];
        this.form.get('divisionPoliticaNivel2ExpedicionDocumentoId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosExpedicionDocumento);
        }
      }
    );

    this.form.get('paisResidenciaId').valueChanges.subscribe(
      (value) => {
        this.departamentosResidencia = [];
        this.municipiosResidencia = [];
        this.form.get('departamentoResidenciaId').setValue(null);
        this.form.get('divisionPoliticaNivel2ResidenciaId').setValue(null);
        if (value != null) {
          this._departamentos(value, this.departamentosResidencia);
        }
      }
    );

    this.form.get('departamentoResidenciaId').valueChanges.subscribe(
      (value) => {
        this.municipiosResidencia = [];
        this.form.get('divisionPoliticaNivel2ResidenciaId').setValue(null);
        if (value != null) {
          this._municipios(value, this.municipiosResidencia);
        }
      }
    );

  }

  crearDocumentoHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/documentos`],
    );
  }

  crearExperienciaHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/experiencia-laboral`],
    );
  }

  crearEstudioHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/estudio`],
    );
  }

  crearFamiliarHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/familiar`],
    );
  }

  editarDatosBasicosHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/funcionarios/${this.item.id}/datos-basicos`],
    );
  }

  crearContratoBasicosHandle(event): void {
    this._router.navigate(
      [`/administracion-personal/contratos/crear`],
    );
  }

  crearRetefuenteHandle(event): void {
    const dialogRef = this._matDialog.open(CrearRetefuenteComponent, {
      panelClass: 'modal-dialog',
      data: { funcionarioId: this._service.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service2.getRetefuente();
      }
    });
  }

  ngAfterViewInit(): void {
  }


  tabChangeHandle(event: MatTabChangeEvent): void {
    this._router.navigate([`/administracion-personal/funcionarios/${this.item.id}/mostrar`],
      { queryParams: { tab: event.index } });
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.ocupacionId = formValue.ocupacion.id;
    formValue.correoElectronicoPersonal = `${formValue.correoElectronicoPersonal}`.trim().length > 0 ? formValue.correoElectronicoPersonal : null;
    formValue.correoElectronicoCorporativo = `${formValue.correoElectronicoCorporativo}`.trim().length > 0 ? formValue.correoElectronicoCorporativo : null;
    this._service.upsert(formValue)
      .then((resp) => {
        if (this.item && this.item.numeroDocumento) {
          const info = {
            cedula: this.item.numeroDocumento,
            nombres: formValue.primerNombre + " " + formValue.primerApellido,
            cambioNombre: true
          };
          localStorage.setItem('nombres', info.nombres.toUpperCase());
          localStorage.setItem('info', JSON.stringify(info));
          this.sharedService.nextMessage(info);
        }

        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/administracion-personal/funcionarios/${resp.id}/mostrar`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        }
        
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }
        if (resp.status === 404) {
          mensaje = 'No se ha configurado un estado por defecto para los funcionarios.';
        }

        this._alcanosSnackBar.snackbar({ clase: 'error' });


        if (resp.status === 400 && 'errors' in error) {

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

          if ('estadoCivilId' in error.errors) {
            const errors = {};
            error.errors.estadoCivilId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estadoCivilId').setErrors(errors);
          }

          if ('ocupacionId' in error.errors) {
            const errors = {};
            error.errors.ocupacionId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('ocupacion').setErrors(errors);
          }

          if ('pensionado' in error.errors) {
            const errors = {};
            error.errors.pensionado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('pensionado').setErrors(errors);
          }

          if ('estadoEmpleadoId' in error.errors) {
            const errors = {};
            error.errors.estadoEmpleadoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estadoEmpleadoId').setErrors(errors);
          }

          if ('fechaNacimiento' in error.errors) {
            const errors = {};
            error.errors.fechaNacimiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaNacimiento').setErrors(errors);
          }

          if ('divisionPoliticaNivel2OrigenId' in error.errors) {
            const errors = {};
            error.errors.divisionPoliticaNivel2OrigenId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('divisionPoliticaNivel2OrigenId').setErrors(errors);
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

          if ('fechaExpedicionDocumento' in error.errors) {
            const errors = {};
            error.errors.fechaExpedicionDocumento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaExpedicionDocumento').setErrors(errors);
          }

          if ('divisionPoliticaNivel2ExpedicionDocumentoId' in error.errors) {
            const errors = {};
            error.errors.divisionPoliticaNivel2ExpedicionDocumentoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('divisionPoliticaNivel2ExpedicionDocumentoId').setErrors(errors);
          }

          if ('nit' in error.errors) {
            const errors = {};
            error.errors.nit.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nit').setErrors(errors);
          }

          if ('digitoVerificacion' in error.errors) {
            const errors = {};
            error.errors.digitoVerificacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('digitoVerificacion').setErrors(errors);
          }

          if ('divisionPoliticaNivel2ResidenciaId' in error.errors) {
            const errors = {};
            error.errors.divisionPoliticaNivel2ResidenciaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('divisionPoliticaNivel2ResidenciaId').setErrors(errors);
          }

          if ('celular' in error.errors) {
            const errors = {};
            error.errors.celular.forEach(element => {
              errors[element] = true;
            });
            this.form.get('celular').setErrors(errors);
          }

          if ('telefonoFijo' in error.errors) {
            const errors = {};
            error.errors.telefonoFijo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('telefonoFijo').setErrors(errors);
          }

          if ('tipoViviendaId' in error.errors) {
            const errors = {};
            error.errors.tipoViviendaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoViviendaId').setErrors(errors);
          }

          if ('direccion' in error.errors) {
            const errors = {};
            error.errors.direccion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('direccion').setErrors(errors);
          }

          if ('claseLibretaMilitarId' in error.errors) {
            const errors = {};
            error.errors.claseLibretaMilitarId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('claseLibretaMilitarId').setErrors(errors);
          }

          if ('numeroLibreta' in error.errors) {
            const errors = {};
            error.errors.numeroLibreta.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroLibreta').setErrors(errors);
          }

          if ('distrito' in error.errors) {
            const errors = {};
            error.errors.distrito.forEach(element => {
              errors[element] = true;
            });
            this.form.get('distrito').setErrors(errors);
          }

          if ('licenciaConduccionAId' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionAId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionAId').setErrors(errors);
          }

          if ('licenciaConduccionBId' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionBId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionBId').setErrors(errors);
          }

          if ('licenciaConduccionCId' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionCId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionCId').setErrors(errors);
          }

          if ('licenciaConduccionAFechaVencimiento' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionAFechaVencimiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionAFechaVencimiento').setErrors(errors);
          }

          if ('licenciaConduccionBFechaVencimiento' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionBFechaVencimiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionBFechaVencimiento').setErrors(errors);
          }

          if ('licenciaConduccionCFechaVencimiento' in error.errors) {
            const errors = {};
            error.errors.licenciaConduccionCFechaVencimiento.forEach(element => {
              errors[element] = true;
            });
            this.form.get('licenciaConduccionCFechaVencimiento').setErrors(errors);
          }


          if ('tallaCamisa' in error.errors) {
            const errors = {};
            error.errors.tallaCamisa.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tallaCamisa').setErrors(errors);
          }


          if ('tallaPantalon' in error.errors) {
            const errors = {};
            error.errors.tallaPantalon.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tallaPantalon').setErrors(errors);
          }


          if ('numeroCalzado' in error.errors) {
            const errors = {};
            error.errors.numeroCalzado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroCalzado').setErrors(errors);
          }


          if ('usaLentes' in error.errors) {
            const errors = {};
            error.errors.usaLentes.forEach(element => {
              errors[element] = true;
            });
            this.form.get('usaLentes').setErrors(errors);
          }


          if ('tipoSangreId' in error.errors) {
            const errors = {};
            error.errors.tipoSangreId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoSangreId').setErrors(errors);
          }

          if ('correoElectronicoPersonal' in error.errors) {
            const errors = {};
            error.errors.correoElectronicoPersonal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('correoElectronicoPersonal').setErrors(errors);
          }

          if ('correoElectronicoCorporativo' in error.errors) {
            const errors = {};
            error.errors.correoElectronicoCorporativo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('correoElectronicoCorporativo').setErrors(errors);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
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


  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateDatosBasicos(formGroup: FormGroup): ValidatorFn {
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
      const dv = (y > 1) ? 11 - y : y;
      if (!(!isNaN(dv) && dv == value.digitoVerificacion)) {
        const errors = Object.assign({}, formGroup.get('digitoVerificacion').errors);
        errors[`El número que ingresaste es incorrecto, por favor verifica el DV.`] = true;
        formGroup.get('digitoVerificacion').setErrors(errors);

      }
      if ((!isNaN(dv) && dv == value.digitoVerificacion)) {
        formGroup.get('digitoVerificacion').setErrors(null);
      }
    }
    if (value.fechaNacimiento != null) {
      let fecha = value.fechaNacimiento;
      if (typeof fecha === 'string') {
        fecha = moment(fecha).toDate();
      } else {
        fecha = value.fechaNacimiento.toDate();
      }
      const hoy = new Date(new Date().setFullYear(new Date().getFullYear()));
      const hoyMenos10 = new Date(new Date().setFullYear(new Date().getFullYear() - 10));
      const hoyMenos100 = new Date(new Date().setFullYear(new Date().getFullYear() - 100));
      if (fecha.getTime() > hoy.getTime()) {
        const errors = {};
        errors['La fecha de nacimiento debe ser menor a la fecha actual.'] = true;
        formGroup.get('fechaNacimiento').setErrors(errors);
      }
      else if (fecha.getTime() > hoyMenos10.getTime()) {
        const errors = {};
        errors['El funcionario debe tener más de diez años.'] = true;
        formGroup.get('fechaNacimiento').setErrors(errors);
      }
      else if (fecha.getTime() < hoyMenos100.getTime()) {
        const errors = {};
        errors['El funcionario no debe tener más de cien años.'] = true;
        formGroup.get('fechaNacimiento').setErrors(errors);
      }


    }
    if (value.fechaExpedicionDocumento != null) {
      let fecha = value.fechaExpedicionDocumento;
      if (typeof fecha === 'string') {
        fecha = moment(fecha).toDate();
      } else {
        fecha = value.fechaExpedicionDocumento.toDate();
      }
      const hoy = new Date(new Date().setFullYear(new Date().getFullYear()));
      if (fecha.getTime() > hoy.getTime()) {
        const errors = {};
        errors['La fecha de expedición debe ser menor a la fecha actual.'] = true;
        formGroup.get('fechaExpedicionDocumento').setErrors(errors);
      }
    }
    if (value.ocupacion != null && typeof value.ocupacion !== 'object') {
      const errors = {};
      errors['Seleccione una ocupacion.'] = true;
      formGroup.get('ocupacion').setErrors(errors);
    }

    return null;
  }



  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
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

  private _filterOcupaciones(value: any): any[] {
    return this.ocupaciones.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0);
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
