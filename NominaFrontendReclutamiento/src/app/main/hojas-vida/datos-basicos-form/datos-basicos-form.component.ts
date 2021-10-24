import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialog, MatTabChangeEvent, MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { DatosBasicosService } from './datos-basicos-form.service';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { startWith, map, catchError, finalize, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Route, Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CookieService } from 'ngx-cookie-service';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { DashboardService } from 'app/main/dashboard/dashboard.service';


@Component({
  selector: 'hojas-vida-datos-basicos-form',
  templateUrl: './datos-basicos-form.component.html',
  styleUrls: ['./datos-basicos-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class DatosBasicosFormComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  dataSource: FilesExperienciaDataSource | FilesEstudiosDataSource | FilesDocumentosDataSource | null;
  dataLength: any;
  displayedColumns: string[] = []

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;


  form: FormGroup;
  formEstudios: FormGroup;
  formExperiencia: FormGroup;
  formDocumentos: FormGroup;
  submit: boolean;

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

  hoja_vida: any;
  loading: boolean = true;
  filteredOcupaciones: Observable<string[]>;
  user: any;

  nivelEducativos: any = [];
  estadoEstudios: any = [];

  tabSelection: number = 0;
  loadingSave: boolean = false;

  // Experiencias
  dataExperiencia: boolean = true;
  experiencias: any = [];
  createExperiencia: boolean;
  updateExperiencia: boolean;

  // Estudios
  dataEstudios: boolean = true;
  estudioss: any = [];
  createEstudios: boolean;
  updateEstudios: boolean;
  filteredProfesiones: Observable<string[]>;
  profesiones: any[];

  // Documentos

  tipoSoportes: any[];
  dataDocumentos: boolean = true;
  createDocumentos: boolean;
  documentos: any[];
  fileToUpload: File = null;
  avance: any;

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
    private _cookieService: CookieService,
    private _dashboardService : DashboardService
  ) {

    this.submit = false;




    this.departamentosOrigen = [];
    this.municipiosOrigen = [];
    this.departamentosExpedicionDocumento = [];
    this.municipiosExpedicionDocumento = [];
    this.departamentosResidencia = [];
    this.municipiosResidencia = [];

    // Formulario de hoja de vida basica
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
      celular: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(10), AlcanosValidators.maxLength(12)]],
      telefonoFijo: [null, [AlcanosValidators.numerico, AlcanosValidators.minLength(7), AlcanosValidators.maxLength(10)]],
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
      correoElectronicoPersonal: [null, [AlcanosValidators.correoElectronico, AlcanosValidators.maxLength(255)]],
    }, { validator: this.validateDatosBasicos });

    // Estudios realizados
    this.formEstudios = this._formBuilder.group({
      id: [null],
      hojaDeVidaId: [null, [Validators.required]],
      nivelEducativoId: [null, [Validators.required]],
      institucionEducativa: [null, [Validators.required, AlcanosValidators.maxLength(255)]],
      estadoEstudio: [null, [Validators.required]],
      paisId: [null, [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, []],
      tarjetaProfesional: [null, [Validators.pattern('^[A-Z0-9\\s-_Ñ]+$'), AlcanosValidators.maxLength(20)]],
      profesion: [null, []],
      titulo: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      observacion: [null, []],
    }, { validators: this.validateEstudio });

    // Experiencia laboral
    this.formExperiencia = this._formBuilder.group({
      id: [null],
      hojaDeVidaId: [null],
      nombreCargo: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      nombreEmpresa: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(255)]],
      telefono: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.minLength(7), AlcanosValidators.maxLength(10)]],
      salario: [null, [AlcanosValidators.numerico, Validators.max(9999999999)]],
      nombreJefeInmediato: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      trabajaActualmente: [null, []],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, []],
      funcionesCargo: [null, []],
      motivoRetiro: [null, []],
      observaciones: [null, []],
    }, { validator: this.validateEstudio });

    // Documentos

    this.formDocumentos = this._formBuilder.group({
      hojaDeVidaId: [null],
      tipoSoporteId: [null, [Validators.required]],
      comentario: [null, []],
      file: [null, [Validators.required]],
    });
  }


  ngOnInit(): void {

    if (this._cookieService.check('User')) {
      let token = JSON.parse(this._cookieService.get('User')).token
      this.user = JSON.parse(atob(token.split('.')[1]))
      this.tabHojaVida()
    } else {
      this._router.navigate(['/logout'])
      return
    }
  }

  ngAfterViewInit(): void {
  }


  tabChangeHandle(index: number, update?: boolean, data?: any): void {
    this.tabSelection = index
    // tomo el index del tab experencia
    if (this.tabSelection === 1) {
      this.dataEstudios = false
      if (!update) {
        this.formEstudios.reset();
        this.updateEstudios = false;
        this.createEstudios = true;
      } else {
        this.createEstudios = true;
        this.updateEstudios = true;

        this.formEstudios.get('estadoEstudio').valueChanges.subscribe((item) => {
          this._changeFechaFinal(item);
        });

        this.filteredProfesiones = this.formEstudios.get('profesion')
          .valueChanges.pipe(
            startWith<string | any>(''),
            map(val => (typeof val === 'string' ? val : val.nombre)),
            map(view => (view ? this._filterProfesiones(view) : this.profesiones.slice())
            ),
          );
        this.formEstudios.patchValue({
          id: data.id,
          nivelEducativoId: data.nivelEducativoId,
          institucionEducativa: data.institucionEducativa,
          estadoEstudio: data.estadoEstudio,
          paisId: data.paisId,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          tarjetaProfesional: data.tarjetaProfesional,
          profesion: data.profesion,
          titulo: data.titulo,
          observacion: data.observacion,
        });
        this._changeFechaFinalEstudios(data.estadoEstudio);

      }
    } else if (this.tabSelection === 2) {
      this.dataExperiencia = false
      if (!update) {
        this.formExperiencia.reset();
        this.updateExperiencia = false;
        this.createExperiencia = true;
      } else {
        this.createExperiencia = true;
        this.updateExperiencia = true;
        this.formExperiencia.patchValue({
          id: data.id,
          nombreCargo: data.nombreCargo,
          nombreEmpresa: data.nombreEmpresa,
          telefono: data.telefono,
          salario: data.salario,
          nombreJefeInmediato: data.nombreJefeInmediato,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          funcionesCargo: data.funcionesCargo,
          trabajaActualmente: data.trabajaActualmente,
          motivoRetiro: data.motivoRetiro,
          observaciones: data.observaciones,
        });
        this._changeFechaFinal(data.trabajaActualmente);
        // this.formExperiencia.markAllAsTouched();
      }
    }

  }

  tabHojaVida() {

    this._service.getGeneros().then((data => {
      this.generos = data.value
    }));

    this._service.getEstadosCiviles().then((data => {
      this.estadoCiviles = data.value;
    }));

    this._service.getOcupaciones().then((data => {
      this.ocupaciones = data.value;
      this.filteredOcupaciones = this.form.get('ocupacion')
        .valueChanges.pipe(
          startWith<string | any>(''),
          map(val => (typeof val === 'string' ? val : val.nombre)),
          map(view => (view ? this._filterOcupaciones(view) : this.ocupaciones.slice())
          ),
        );
    }));

    this._service.getPaises().then((data => {
      this.paises = data.value;
    }));

    this._service.getTipoDocumentos().then((data => {
      this.tipoDocumentos = data.value
    }));

    this._service.getTipoViviendas().then((data => {
      this.tipoViviendas = data.value
    }));

    this._service.getClaseLibretaMilitares().then((data => {
      this.claseLibretaMilitares = data.value
    }));

    this._service.getLicenciasA().then((data => {
      this.licenciasA = data.value
    }));

    this._service.getLicenciasB().then((data => {
      this.licenciasB = data.value
    }));

    this._service.getLicenciasC().then((data => {
      this.licenciasC = data.value
    }));

    this._service.getTipoSangres().then((data => {
      this.tipoSangres = data.value
    }));

    this._service._getAspirante(this.user.jti).then(data => {
      this.loading = false;
      this.hoja_vida = data.value[0]
      if (this.hoja_vida) {
        let paisOrigenId = null;
        let departamentoOrigenId = null;
        let paisExpedicionDocumentoId = null;
        let departamentoExpedicionDocumentoId = null;
        let paisResidenciaId = null;
        let departamentoResidenciaId = null;

        // const sexoId = this._inArray(this.hoja_vida.sexoId, this.generos) ? this.hoja_vida.sexoId : null;
        // const estadoCivilId = this._inArray(this.hoja_vida.estadoCivilId, this.estadoCiviles) ? this.hoja_vida.estadoCivilId : null;
        // const tipoDocumentoId = this._inArray(this.hoja_vida.tipoDocumentoId, this.tipoDocumentos) ? this.hoja_vida.tipoDocumentoId : null;

        if (this.hoja_vida.divisionPoliticaNivel2Origen != null && this.hoja_vida.divisionPoliticaNivel2Origen.divisionPoliticaNivel1 != null) {
          // tslint:disable-next-line: max-line-length
          paisOrigenId = this._inArray(this.hoja_vida.divisionPoliticaNivel2Origen.divisionPoliticaNivel1.paisId, this.paises) ? this.hoja_vida.divisionPoliticaNivel2Origen.divisionPoliticaNivel1.paisId : null;
          departamentoOrigenId = this.hoja_vida.divisionPoliticaNivel2Origen.divisionPoliticaNivel1Id;
        }

        if (this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumento != null && this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1 != null) {
          // tslint:disable-next-line: max-line-length
          paisExpedicionDocumentoId = this._inArray(this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1.paisId, this.paises) ? this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1.paisId : null;
          departamentoExpedicionDocumentoId = this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumento.divisionPoliticaNivel1Id;
        }

        if (this.hoja_vida.divisionPoliticaNivel2Residencia != null && this.hoja_vida.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1 != null) {
          // tslint:disable-next-line: max-line-length
          paisResidenciaId = this._inArray(this.hoja_vida.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1.paisId, this.paises) ? this.hoja_vida.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1.paisId : null;
          departamentoResidenciaId = this.hoja_vida.divisionPoliticaNivel2Residencia.divisionPoliticaNivel1Id;
        }

        this.form.patchValue({
          id: this.hoja_vida.id,
          primerNombre: this.hoja_vida.primerNombre,
          segundoNombre: this.hoja_vida.segundoNombre,
          primerApellido: this.hoja_vida.primerApellido,
          segundoApellido: this.hoja_vida.segundoApellido,
          sexoId: this.hoja_vida.sexoId,
          estadoCivilId: this.hoja_vida.estadoCivilId,
          ocupacion: this.hoja_vida.ocupacion,
          pensionado: this.hoja_vida.pensionado,
          estadoEmpleadoId: this.hoja_vida.estadoEmpleadoId,
          fechaNacimiento: this.hoja_vida.fechaNacimiento,
          paisOrigenId: paisOrigenId,
          departamentoOrigenId: departamentoOrigenId,
          divisionPoliticaNivel2OrigenId: this.hoja_vida.divisionPoliticaNivel2OrigenId,
          tipoDocumentoId: this.hoja_vida.tipoDocumentoId,
          numeroDocumento: this.hoja_vida.numeroDocumento,
          fechaExpedicionDocumento: this.hoja_vida.fechaExpedicionDocumento,
          paisExpedicionDocumentoId: paisExpedicionDocumentoId,
          departamentoExpedicionDocumentoId: departamentoExpedicionDocumentoId,
          divisionPoliticaNivel2ExpedicionDocumentoId: this.hoja_vida.divisionPoliticaNivel2ExpedicionDocumentoId,
          nit: this.hoja_vida.nit,
          digitoVerificacion: this.hoja_vida.digitoVerificacion,
          paisResidenciaId: paisResidenciaId,
          departamentoResidenciaId: departamentoResidenciaId,
          divisionPoliticaNivel2ResidenciaId: this.hoja_vida.divisionPoliticaNivel2ResidenciaId,
          celular: this.hoja_vida.celular,
          telefonoFijo: this.hoja_vida.telefonoFijo,
          tipoViviendaId: this.hoja_vida.tipoViviendaId,
          direccion: this.hoja_vida.direccion,
          claseLibretaMilitarId: this.hoja_vida.claseLibretaMilitarId,
          numeroLibreta: this.hoja_vida.numeroLibreta,
          distrito: this.hoja_vida.distrito,
          licenciaConduccionAId: this.hoja_vida.licenciaConduccionAId,
          licenciaConduccionBId: this.hoja_vida.licenciaConduccionBId,
          licenciaConduccionCId: this.hoja_vida.licenciaConduccionCId,
          licenciaConduccionAFechaVencimiento: this.hoja_vida.licenciaConduccionAFechaVencimiento,
          licenciaConduccionBFechaVencimiento: this.hoja_vida.licenciaConduccionBFechaVencimiento,
          licenciaConduccionCFechaVencimiento: this.hoja_vida.licenciaConduccionCFechaVencimiento,
          tallaCamisa: this.hoja_vida.tallaCamisa,
          tallaPantalon: this.hoja_vida.tallaPantalon,
          numeroCalzado: this.hoja_vida.numeroCalzado,
          usaLentes: this.hoja_vida.usaLentes,
          tipoSangreId: this.hoja_vida.tipoSangreId,
          correoElectronicoPersonal: this.hoja_vida.correoElectronicoPersonal,
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
    })

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

  tabEstudios(data) {
    window.scroll(0, 0);
    this.dataExperiencia = false;
    this.dataDocumentos = false;
    if (!this.createEstudios) {
      this.displayedColumns = ['nivelEducativo/nombre', 'titulo', 'accion']
      this.dataSource = new FilesEstudiosDataSource(this._service, data)
      this.dataSource.loadTable("fechaCreacion", 0, 5)
      this._service._getEstudios(data).subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.dataSource['Subject'].subscribe(value => {
            if (value.length > 0) {
              this.loading = false;
              this.dataLength = data['@odata.count'];
              this.estudioss = data['value'][0]
              this.dataEstudios = true;
              setTimeout(() => {
                this.sort.sortChange.subscribe(() => this.paginator.pageIndex);
                merge(this.sort.sortChange, this.paginator.page)
                  .pipe(
                    tap(() => {
                      switch (this.sort.active) {
                        case 'nivelEducativo/nombre': return this.loadPage('nivelEducativo/nombre')
                        case 'titulo': return this.loadPage('titulo')
                        case 'fechaCreacion': return this.loadPage('fechaCreacion ' + this.sort.direction)
                        default: return 0;
                      }
                    })
                  )
                  .subscribe();
              }, 200);
            }
          });
        } else {
          this.loading = false;
          this.dataEstudios = false;
          this.createEstudios = true;
        }
      });

    } else {
      this.loading = false;
      this.dataEstudios = false;
    }
    this._service.getNivelEducativos().then((data => {
      this.nivelEducativos = data.value
    }));

    this.estadoEstudios = [
      {
        id: 'EnCurso',
        nombre: 'En curso',
        fechaFinalEnabled: false
      },
      {
        id: 'Aplazado',
        nombre: 'Aplazado',
        fechaFinalEnabled: false
      },
      {
        id: 'Abandonado',
        nombre: 'Abandonado',
        fechaFinalEnabled: false
      },
      {
        id: 'Culminado',
        nombre: 'Culminado',
        fechaFinalEnabled: true
      }
    ];

    this._service.getPaises().then((data => {
      this.paises = data.value;
    }));

    this._service.getProfesiones().then((data => {
      this.profesiones = data.value;

      this.filteredProfesiones = this.formEstudios.get('profesion')
        .valueChanges.pipe(
          startWith<string | any>(''),
          map(val => (typeof val === 'string' ? val : val.nombre)),
          map(view => (view ? this._filterProfesiones(view) : this.profesiones.slice())
          ),
        );
    }));





    this.formEstudios.get('estadoEstudio').valueChanges.subscribe((item) => {
      this._changeFechaFinalEstudios(item);
    });


  }

  private _changeFechaFinalEstudios(id: string): void {
    let obj = null;
    this.estadoEstudios.forEach(element => {
      if (`${element.id}` === `${id}`) {
        obj = element;
      }
    });
    if (obj != null && !obj.fechaFinalEnabled) {
      this.formEstudios.get('fechaFin').setValue(null);
      this.formEstudios.get('fechaFin').disable();
    } else {
      this.formEstudios.get('fechaFin').enable();
    }

  }

  private _filterProfesiones(value: any): any[] {
    return this.profesiones.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }

  tabExperiencia(data) {
    window.scroll(0, 0);
    this.dataEstudios = false;
    this.dataDocumentos = false;
    if (!this.createExperiencia) {
      this.displayedColumns = ['nombreCargo', 'nombreEmpresa', 'telefono', 'accion']
      this.dataSource = new FilesExperienciaDataSource(this._service, data)
      this.dataSource.loadTable("fechaCreacion", 0, 5)
      this._service._getExperiencias(data).subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.dataSource['Subject'].subscribe(value => {
            if (value.length > 0) {
              this.loading = false;
              this.dataLength = data['@odata.count'];
              this.experiencias = data['value'][0]
              this.dataExperiencia = true;
              setTimeout(() => {
                this.sort.sortChange.subscribe(() => this.paginator.pageIndex);
                merge(this.sort.sortChange, this.paginator.page)
                  .pipe(
                    tap(() => {
                      switch (this.sort.active) {
                        case 'nombreCargo': return this.loadPage('nombreCargo')
                        case 'nombreEmpresa': return this.loadPage('nombreEmpresa')
                        case 'telefono': return this.loadPage('telefono')
                        case 'fechaCreacion': return this.loadPage('fechaCreacion ' + this.sort.direction)
                        default: return 0;
                      }
                    })
                  )
                  .subscribe();
              }, 200);
            }
          });
        } else {
          this.loading = false;
          this.dataExperiencia = false;
          this.createExperiencia = true;
        }
      });

    } else {
      this.loading = false;
      this.dataExperiencia = false;
    }

    this.formExperiencia.get('trabajaActualmente').valueChanges.subscribe((item) => {
      this._changeFechaFinal(item);
    });
  }

  tabDocumentos(data) {
    window.scroll(0, 0);
    this.dataEstudios = false;
    this.dataExperiencia = false;
    if (!this.createDocumentos) {
      this.displayedColumns = ['tipoSoporte/nombre', 'comentario', 'accion']
      this.dataSource = new FilesDocumentosDataSource(this._service, data)
      this.dataSource.loadTable("fechaCreacion", 0, 5)
      this._service._getDocumentos(data).subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.dataSource['Subject'].subscribe(value => {
            if (value.length > 0) {
              this.loading = false;
              this.dataLength = data['@odata.count'];
              this.documentos = data['value'][0]
              this.dataDocumentos = true;
              setTimeout(() => {
                this.sort.sortChange.subscribe(() => this.paginator.pageIndex);
                merge(this.sort.sortChange, this.paginator.page)
                  .pipe(
                    tap(() => {
                      switch (this.sort.active) {
                        case 'tipoSoporte/nombre': return this.loadPage('tipoSoporte/nombre')
                        case 'comentario': return this.loadPage('comentario')
                        case 'fechaCreacion': return this.loadPage('fechaCreacion ' + this.sort.direction)
                        default: return 0;
                      }
                    })
                  )
                  .subscribe();
              }, 200);
            }
          });
        } else {
          this.loading = false;
          this.dataDocumentos = false;
          this.createDocumentos = true;
        }
      });
    } else {
      this.loading = false;
      this.dataDocumentos = false;
    }
    this._service.getTipoSoportes().then(data => {
      this.tipoSoportes = data.value
    })
  }

  atrasExperiencia() {
    this.loading = true;
    this.createExperiencia = false;
    this.tabExperiencia(this.hoja_vida);
  }

  atrasEstudios() {
    this.loading = true;
    this.createEstudios = false;
    this.tabEstudios(this.hoja_vida);
  }

  atrasDocumentos() {
    this.loading = true;
    this.createDocumentos = false;
    this.tabDocumentos(this.hoja_vida);
  }

  eliminarExperiencia(dato) {
    this.loadingSave = true;
    this._service._deleteExperiencia(dato).then(data => {
      this.loadingSave = false;
      this.dataExperiencia = true;
      this.createExperiencia = false;
      this.loading = true;
      this.formExperiencia.reset();
      this.tabExperiencia(this.hoja_vida)
      this._alcanosSnackBar.snackbar({ clase: 'exito' });
      this.submit = false;
    })
  }

  eliminarEstudio(dato) {
    this.loadingSave = true;
    this._service._deleteEstudio(dato).then(data => {
      this.loadingSave = false;
      this.dataEstudios = true;
      this.createEstudios = false;
      this.loading = true;
      this.formEstudios.reset();
      this.tabEstudios(this.hoja_vida)
      this._alcanosSnackBar.snackbar({ clase: 'exito' });
      this.submit = false;
    })
  }

  eliminaDocumento(dato) {
    this.loadingSave = true;
    this._service._deleteDocumento(dato).then(data => {
      this.loadingSave = false;
      this.dataDocumentos = true;
      this.createDocumentos = false;
      this.loading = true;
      this.formDocumentos.reset();
      this.tabDocumentos(this.hoja_vida)
      this._alcanosSnackBar.snackbar({ clase: 'exito' });
      this.submit = false;
    })
  }

  fileInputHandle(event): void {
    let errors = {};
    const validFileExtensions = ['pdf'];
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 2097152; // unidad de medida bits (2 Mb)

    if (validFileExtensions.includes(extension) == false) {
      errors['El archivo no tiene una extensión válida.'] = true;
      this.form.get('file').setErrors(errors);
    }

    if (event.target.files[0].size > maxFileSize) {
      errors['El archivo tiene un tamaño mayor al máximo permitido.'] = true;
      this.form.get('file').setErrors(errors);
    }

    if (event.target.files && event.target.files.length) {
      this.fileToUpload = event.target.files[0];
    }
  }

  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjunto}`, '_blank');
  }

  tabChangeHandleLoadData(event: MatTabChangeEvent, data?: any): void {
    this.loading = true;
    if (event.index === 0) {
      this.createExperiencia = false;
      this.tabHojaVida()
    } else if (event.index === 1) {
      // this.updateExperiencia = false;
      // this.createExperiencia = false;
      this.tabEstudios(data)
    } else if (event.index === 2) {
      this.tabExperiencia(data)
    } else if (event.index === 3) {
      this.tabDocumentos(data)
      // this.createExperiencia = false;
      // this.loading = false;
    }
  }

  validateEstudio(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.fechaInicio && value.fechaFin) {
      formGroup.get('fechaFin').setErrors(null);
      let fechaInicio = value.fechaInicio;
      let fechaFin = value.fechaFin;
      if (typeof fechaInicio === 'string') {
        fechaInicio = moment(fechaInicio).toDate();
      } else {
        fechaInicio = value.fechaInicio.toDate();
      }

      if (typeof fechaFin === 'string') {
        fechaFin = moment(fechaFin).toDate();
      } else {
        fechaFin = value.fechaFin.toDate();
      }

      if (fechaInicio.getTime() > fechaFin.getTime()) {
        const errors = {};
        errors['La fecha de finalización no puede ser menor a la fecha de inicio.'] = true;
        formGroup.get('fechaFin').setErrors(errors);
      }

    }
    return null;
  }

  getAdvance(){
    this._service.getAvances(this.user.jti).then(data => {
      this.avance = data;
      if(this.avance.avanceHojaDeVida < 60){
          this._dashboardService.onBlockChanged.next(true);
          this._dashboardService.onFilterChanged.next('hoja_vida');
      }else{
          this._dashboardService.onBlockChanged.next(false);
          this._dashboardService.onFilterChanged.next('hoja_vida');
      }
  })
  }

  // Guardar Hoja de vida
  guardarHandle(event): void {
    this.submit = true;
    this.loadingSave = true;
    const formValue = this.form.value;
    formValue.ocupacionId = formValue.ocupacion.id;
    formValue.correoElectronicoPersonal = `${formValue.correoElectronicoPersonal}`.trim().length > 0 ? formValue.correoElectronicoPersonal : null;
    this._service._editar(formValue)
      .then((resp) => {
        this.loadingSave = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.getAdvance()
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.loadingSave = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        }
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }
        if (resp.status === 404) {
          mensaje = 'No se ha configurado un estado por defecto para los aspirantes.';
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

        }

      });

  }

  // Guardar experiencia laboral

  guardarExperienciaHandle(event): void {
    this.submit = true;
    this.loadingSave = true;
    const formValue = this.formExperiencia.value;
    formValue.hojaDeVidaId = this.hoja_vida.id
    this._service.upsert(formValue)
      .then((resp) => {
        this.loadingSave = false;
        this.dataExperiencia = true;
        this.createExperiencia = false;
        this.loading = true;
        this.tabExperiencia(this.hoja_vida)
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;

      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.loadingSave = false;
        if (resp.status === 400 && 'errors' in resp.error) {

          if ('nombreCargo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombreCargo.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('nombreCargo').setErrors(errors);
          }

          if ('telefono' in resp.error.errors) {
            const errors = {};
            resp.error.errors.telefono.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('telefono').setErrors(errors);
          }

          if ('salario' in resp.error.errors) {
            const errors = {};
            resp.error.errors.salario.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('salario').setErrors(errors);
          }

          if ('nombreJefeInmediato' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombreJefeInmediato.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('nombreJefeInmediato').setErrors(errors);
          }

          if ('fechaInicio' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('fechaInicio').setErrors(errors);
          }

          if ('fechaFin' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('fechaFin').setErrors(errors);
          }

          if ('funcionesCargo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.funcionesCargo.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('funcionesCargo').setErrors(errors);
          }

          if ('motivoRetiro' in resp.error.errors) {
            const errors = {};
            resp.error.errors.motivoRetiro.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('motivoRetiro').setErrors(errors);
          }

          if ('observaciones' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observaciones.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('observaciones').setErrors(errors);
          }

        }
      });
  }

  // Guardar experiencia laboral

  guardarEstudioHandle(event): void {
    this.submit = true;
    this.loadingSave = true;
    const formValue = this.formEstudios.value;
    formValue.hojaDeVidaId = this.hoja_vida.id
    if ('profesion' in formValue && formValue.profesion != null) {
      formValue.profesionId = formValue.profesion.id;
      formValue.profesion = null;
    }
    this._service.upsertEstudios(formValue)
      .then((resp) => {
        this.loadingSave = false;
        this.dataEstudios = true;
        this.createEstudios = false;
        this.loading = true;
        this.tabEstudios(this.hoja_vida)
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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

          if ('nivelEducativoId' in resp.error.errors) {
            const errors = {};
            error.errors.nivelEducativoId.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('nivelEducativoId').setErrors(errors);
          }

          if ('institucionEducativa' in error.errors) {
            const errors = {};
            error.errors.institucionEducativa.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('institucionEducativa').setErrors(errors);
          }

          if ('fechaFin' in error.errors) {
            const errors = {};
            error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('fechaFin').setErrors(errors);
          }

          if ('fechaInicio' in error.errors) {
            const errors = {};
            error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('fechaInicio').setErrors(errors);
          }

          if ('tarjetaProfesional' in error.errors) {
            const errors = {};
            error.errors.tarjetaProfesional.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('tarjetaProfesional').setErrors(errors);
          }

          if ('profesionId' in error.errors) {
            const errors = {};
            error.errors.profesionId.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('profesion').setErrors(errors);
          }

          if ('titulo' in error.errors) {
            const errors = {};
            error.errors.titulo.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('titulo').setErrors(errors);
          }

          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.formExperiencia.get('observacion').setErrors(errors);
          }

        }
      });

  }

  // Guardar soportes

  guardarDocumentoHandle(event): void {
    this.submit = true;
    const formValue = this.formDocumentos.value;
    formValue.hojaDeVidaId = this.hoja_vida.id
    this._service.upload(this.fileToUpload).then(
      (fileResp) => {
        formValue.file = null;
        formValue.adjunto = fileResp.object_id;
        this._service.crearDocumento(formValue)
          .then((resp) => {
            this.loadingSave = false;
            this.dataDocumentos = true;
            this.createDocumentos = false;
            this.loading = true;
            this.tabDocumentos(this.hoja_vida)
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
            this.submit = false;
          }
          ).catch((resp: HttpErrorResponse) => {
            this.submit = false;
            if (resp.status === 400 && 'errors' in resp.error) {

              if ('nombre' in resp.error.errors) {
                const errors = {};
                resp.error.errors.nombre.forEach(element => {
                  errors[element] = true;
                });
                this.formDocumentos.get('nombre').setErrors(errors);
              }

              if ('comentario' in resp.error.errors) {
                const errors = {};
                resp.error.errors.comentario.forEach(element => {
                  errors[element] = true;
                });
                this.formDocumentos.get('comentario').setErrors(errors);
              }

            }
          });
      })
      .catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this._alcanosSnackBar.snackbar({ clase: 'error' });
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
        errors['El aspirante debe tener más de diez años.'] = true;
        formGroup.get('fechaNacimiento').setErrors(errors);
      }
      else if (fecha.getTime() < hoyMenos100.getTime()) {
        const errors = {};
        errors['El aspirante no debe tener más de cien años.'] = true;
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

  loadPage(sort?: string) {
    if (!sort) {
      sort = 'fechaCreacion'
    }
    this.dataSource.loadTable(
      (this.sort.active + ' ' + this.sort.direction),
      this.paginator.pageSize * this.paginator.pageIndex,
      this.paginator.pageSize,
    );
  }

  private _changeFechaFinal(disabled: boolean | string): void {
    if (`${disabled}` === 'true') {
      this.formExperiencia.get('fechaFin').setValue(null);
      this.formExperiencia.get('fechaFin').disable();
    } else {
      this.formExperiencia.get('fechaFin').enable();
    }

  }

}

export class FilesExperienciaDataSource implements DataSource<any> {

  private Subject = new BehaviorSubject<any[]>([]);
  private subject1 = new BehaviorSubject<any>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private _datosService: DatosBasicosService, private data: any) { }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.Subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.Subject.complete();
    this.loadingSubject.complete();
  }
  loadTable(orderBy: string = "fechaCreacion", skip: number = 0,
    top: number = 5) {
    this.loadingSubject.next(true);

    this._datosService._getExperiencias(this.data, orderBy, skip, top).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.Subject.next(data['value']);
          this.subject1.next(data['@odata.count']);
        }

      });
  }
}

export class FilesEstudiosDataSource implements DataSource<any> {

  private Subject = new BehaviorSubject<any[]>([]);
  private subject1 = new BehaviorSubject<any>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private _datosService: DatosBasicosService, private data: any) { }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.Subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.Subject.complete();
    this.loadingSubject.complete();
  }
  loadTable(orderBy: string = "fechaCreacion", skip: number = 0,
    top: number = 5) {
    this.loadingSubject.next(true);

    this._datosService._getEstudios(this.data, orderBy, skip, top).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.Subject.next(data['value']);
          this.subject1.next(data['@odata.count']);
        }

      });
  }
}


export class FilesDocumentosDataSource implements DataSource<any> {

  private Subject = new BehaviorSubject<any[]>([]);
  private subject1 = new BehaviorSubject<any>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private _datosService: DatosBasicosService, private data: any) { }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.Subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.Subject.complete();
    this.loadingSubject.complete();
  }
  loadTable(orderBy: string = "fechaCreacion", skip: number = 0,
    top: number = 5) {
    this.loadingSubject.next(true);

    this._datosService._getDocumentos(this.data, orderBy, skip, top).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(data => {
        if (data['@odata.count'] > 0) {
          this.Subject.next(data['value']);
          this.subject1.next(data['@odata.count']);
        }

      });
  }
}