import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { ClaseAusentismoAlcanos } from '@alcanos/constantes/clase-ausentismo';
import { isArray } from 'util';
import { estadoAusentismosAlcanos } from '@alcanos/constantes/estado-ausentismos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';

@Component({
  selector: 'ausentismos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  horas: boolean;
  item: any;
  estadoAusentismos = estadoAusentismosAlcanos;
  enviroments: any;
  documentoAdjunto: any;
  editarBeneficio: boolean;
  funcionarios: any[];
  claseAusentismosOptions: any[];
  tipoAusentismosOptions: any[];
  prorrogaOptions: any[];

  fileToUpload: File | null;

  diasAusentismo: number | null;


  filteredFuncionarios: Observable<any>;
  filteredDiagnostico: Observable<string[]>;
  ocultar: boolean;
  licenciaRemunerada: boolean;

  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,
    private _matDialog: MatDialog
  ) {
    this.fileToUpload = null;
    this.enviroments = environmentAlcanos.gestorArchivos;
    this.funcionarios = [];
    this.diasAusentismo = null;
    this.claseAusentismosOptions = this._service.onClaseAusentismosChanged.value;
    this.tipoAusentismosOptions = [];
    this.prorrogaOptions = [];

    this.form = this._formBuilder.group({
      id: [null],
      funcionario: [null, [Validators.required]],
      claseAusentismoId: [null, [Validators.required]],
      tipoAusentismoId: [null, [Validators.required]],
      diagnosticoId: [null, []],
      fechaInicio: [null, [Validators.required]],
      horaInicio: [null, []],
      fechaFin: [null, [Validators.required]],
      horaFin: [null, []],
      fechaIniciaReal: [null, [Validators.required]],
      fechaFinalReal: [null, [Validators.required]],
      prorrogaId: [null],
      observacion: [null],
      numeroIncapacidad: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(9999999999)]],
      file: [null],
    }, { validators: this.validate });
    this.ocultar = false;
    this.licenciaRemunerada = false;

    this.submit = false;
    // ocultar
    this.form.get('diagnosticoId').disable();
    this.form.get('numeroIncapacidad').disable();
    this.form.get('prorrogaId').disable();
    // licencia remunerada 
    this.form.get('horaInicio').disable();
    this.form.get('horaFin').disable();
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;
        let prorrogaId = null;
        if (this.item.ausentismoDe != null && isArray(this.item.ausentismoDe)) {
          this.item.ausentismoDe.forEach(element => {
            console.log(element);
            prorrogaId = element.prorrogaId;
          });
        }
        if (this.item.adjunto != null) {
          this.documentoAdjunto = this.enviroments + '/bucket/download?document_id=' + this.item.adjunto; 
        }else{
          this.editarBeneficio = true; 
        }
        const diagnostico = this.item.diagnosticoCie != null ? this.item.diagnosticoCie : null;

        this.form.patchValue({
          id: this.item.id,
          funcionario: this.item.funcionario,
          claseAusentismoId: this.item.tipoAusentismo.claseAusentismoId,
          tipoAusentismoId: this.item.tipoAusentismo.id,
          diagnosticoId: diagnostico,
          fechaInicio: this.item.fechaInicio,
          horaInicio: (this.item.horaInicio) ? moment(`2000-01-01 ${this.item.horaInicio}`).format('HH:mm:ss') : null,
          fechaFin: this.item.fechaFin,
          fechaIniciaReal: this.item.fechaIniciaReal,
          fechaFinalReal: this.item.fechaFinalReal,
          horaFin: (this.item.horaFin) ? moment(`2000-01-01 ${this.item.horaFin}`).format('HH:mm:ss') : null,
          prorrogaId: prorrogaId,
          numeroIncapacidad: this.item.numeroIncapacidad,
        });

        this._changeClase();
        this._getProrrogas();
        this.form.markAllAsTouched();

        // Object.keys(this.form.controls).forEach(key => {
        //   console.log(`${key} es valido : ${this.form.get(key).valid}`);
        //   console.log(this.form.get(key).errors);
        // });

        // if (this.item.estado === this.estadoAusentismos.aprobado || this.item.estado === this.estadoAusentismos.aplicado) {
        //   this.form.disable();
        //   this.form.get('id').enable();
        //   this.form.get('fechaFin').enable();
        // }

        if (this.item.validaTodo) {
          this.form.enable();
          this.form.get('funcionario').disable();
        }

        if (this.item.validaFechaFinal) {
          this.form.disable();
          this.form.get('id').enable();
          this.form.get('fechaFin').enable();
        }

      } else {
        this.editarBeneficio = true;
      }
    });

    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.funcionariosValue(value))
      );

    this.filteredDiagnostico = this.form.get('diagnosticoId')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getDiagnosticos(value))
      );


    this.form.get('funcionario')
      .valueChanges.subscribe(value => {
        this.form.get('prorrogaId').setValue(null);
        this._getProrrogas();
      });
    this.form.get('claseAusentismoId')
      .valueChanges.subscribe(value => {
        this.form.get('prorrogaId').setValue(null);
        this.form.get('diagnosticoId').setValue(null);
        this.form.get('numeroIncapacidad').setValue(null);
        this.form.get('tipoAusentismoId').setValue(null);
        this._changeClase();
        this._getProrrogas();
      });
    this.form.get('fechaInicio')
      .valueChanges.subscribe(value => {
        this.form.get('prorrogaId').setValue(null);
        this._getProrrogas();
      });

  }

  ngAfterViewInit(): void { }


  editarArchivoHandle(event, element): void {
    this.editarBeneficio = true;
  }

  funcionariosValue(value: string): any {
    let conteo = null;
    this._service.onFuncionariosCountChanged.subscribe(resp => {
      conteo = resp;
    });
    if (conteo == 0) {
      this.form.get('funcionario').setErrors({ 'El funcionario que intentas ingresar no tiene un contrato vigente. Por favor revisa.': true });
    }
    return this._service.getFuncionarios(value);
  }

  strToDateFormat(str: string): string {
    moment.locale('es');
    return moment(str).format('MMM DD, Y  ');
  }

  fileInputHandle(event): void {
    let extension = null;
    let maxFileSize = null;
    const errors = {};
    const validFileExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    if (event.target.files.length > 0) {
      extension = event.target.files[0].name.split('.').pop();
      maxFileSize = 10485760; // unidad de medida bits (10 Mb)
      if (validFileExtensions.includes(extension) == false) {
        errors['El archivo no tiene una extensión válida.'] = true;
        this.form.get('file').setErrors(errors);
      }

      if (event.target.files[0].size > maxFileSize) {
        errors['El archivo tiene un tamaño mayor al máximo permitido.'] = true;
        this.form.get('file').setErrors(errors);
      }
    }


    if (event.target.files && event.target.files.length) {
      this.fileToUpload = event.target.files[0];
    }
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.id == null && value.fechaInicio != null) {
      formGroup.get('fechaInicio').setErrors(null);
      let fechaInicio = value.fechaInicio;
      if (typeof fechaInicio === 'string') {
        fechaInicio = moment(fechaInicio).toDate();
      } else {
        fechaInicio = value.fechaInicio.toDate();
      }
      //
      if (fechaInicio.getTime() >= moment().add(15, 'days').toDate().getTime()) {
        const errors = {};
        errors['La fecha inicial no puede ser mayor a la fecha actual más de 15 días.'] = true;
        formGroup.get('fechaInicio').setErrors(errors);
      }
      // if (fechaInicio.getTime() > moment().toDate().getTime()) {
      //   const errors = {};
      //   errors['La fecha inicial no debe ser mayor a la fecha actual.'] = true;
      //   formGroup.get('fechaInicio').setErrors(errors);
      // }
      // 
      if (fechaInicio.getTime() < moment().add(-1, 'years').toDate().getTime()) {
        const errors = {};
        errors['La fecha inicial no debe ser menor a un año.'] = true;
        formGroup.get('fechaInicio').setErrors(errors);
      }
    }

    if (value.funcionario != null && typeof value.funcionario !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un funcionario.'] = true;
      formGroup.get('funcionario').setErrors(errors);
    }

    if (value.fechaInicio != null && value.fechaFin != null) {
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

      if (fechaFin.getTime() < fechaInicio.getTime()) {
        const errors = {};
        errors['La fecha final que intentas guardar, no puede ser menor que la fecha inicial.'] = true;
        formGroup.get('fechaFin').setErrors(errors);
      } else {
        // validacion de la hora
        if (value.horaInicio != null && value.horaFin != null) {
          formGroup.get('horaFin').setErrors(null);
          fechaInicio = moment(moment(fechaInicio).format(`YYYY-MM-DD ${value.horaInicio}`)).toDate();
          fechaFin = moment(moment(fechaFin).format(`YYYY-MM-DD ${value.horaFin}`)).toDate();
          if (fechaFin.getTime() < fechaInicio.getTime()) {
            const errors = {};
            errors['La hora final que intentas guardar, no puede ser menor que la hora inicial.'] = true;
            formGroup.get('horaFin').setErrors(errors);
          }
        }
      }
    }

    if (value.fechaIniciaReal != null) {
      formGroup.get('fechaFin').setErrors(null);
      let fechaInicioMenosAnio;
      let fechaInicioQuinceDias;
      let fechaIniciaReal = value.fechaIniciaReal;
      fechaInicioMenosAnio = moment().subtract(1, 'years').toDate();
      fechaInicioQuinceDias = moment().add(15, 'day').toDate();

      if (typeof fechaIniciaReal === 'string') {
        fechaIniciaReal = moment(fechaIniciaReal).toDate();
      } else {
        fechaIniciaReal = value.fechaIniciaReal.toDate();
      }

      if (fechaIniciaReal.getTime() < fechaInicioMenosAnio.getTime()) {
        const errors = {};
        errors['La fecha inicial real no debe ser menor a un año.'] = true;
        formGroup.get('fechaIniciaReal').setErrors(errors);
      }

      if (fechaIniciaReal.getTime() > fechaInicioQuinceDias.getTime()) {
        const errors = {};
        errors['La fecha inicial real no puede ser mayor a la fecha actual más de 15 días.'] = true;
        formGroup.get('fechaIniciaReal').setErrors(errors);
      }


    }

    if (value.fechaIniciaReal != null && value.fechaFinalReal != null) {
      formGroup.get('fechaFin').setErrors(null);
      let fechaIniciaReal = value.fechaIniciaReal;
      let fechaFinalReal = value.fechaFinalReal;


      if (typeof fechaIniciaReal === 'string') {
        fechaIniciaReal = moment(fechaIniciaReal).toDate();
      } else {
        fechaIniciaReal = value.fechaIniciaReal.toDate();
      }
      if (typeof fechaFinalReal === 'string') {
        fechaFinalReal = moment(fechaFinalReal).toDate();
      } else {
        fechaFinalReal = value.fechaFinalReal.toDate();
      }

      if (fechaIniciaReal.getTime() > fechaFinalReal.getTime()) {
        const errors = {};
        errors['La fecha final real que intentas guardar no puede ser menor que la fecha inicial real.'] = true;
        formGroup.get('fechaFinalReal').setErrors(errors);
      }
    }

    return null;
  }


  private _changeClase(): void {
    const clase = this.form.get('claseAusentismoId').value;
    this.ocultar = false;
    this.form.get('prorrogaId').disable();
    this.form.get('diagnosticoId').disable();
    this.form.get('numeroIncapacidad').disable();

    this.licenciaRemunerada = false;
    this.form.get('horaInicio').disable();
    this.form.get('horaFin').disable();

    this.tipoAusentismosOptions = [];

    if (this._hasSelectedIncapacidad()) {
      this.form.get('diagnosticoId').setValidators([Validators.required]);
      this.form.get('numeroIncapacidad').setValidators([Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(10)]);

      this.form.get('prorrogaId').enable();
      this.form.get('diagnosticoId').enable();
      this.form.get('numeroIncapacidad').enable();
      this.ocultar = true;

    }

    if (this._hasSelectedLicenciaRemunerada()) {
      this.licenciaRemunerada = true;
      this.form.get('horaInicio').enable();
      this.form.get('horaFin').enable();
      this.form.get('horaInicio').setValidators([Validators.required]);
      this.form.get('horaFin').setValidators([Validators.required]);
    } else {
      this.form.get('horaInicio').disable();
      this.form.get('horaFin').disable();
      this.form.get('horaInicio').clearValidators();
      this.form.get('horaInicio').setErrors(null);
      this.form.get('horaFin').clearValidators();
      this.form.get('horaFin').setErrors(null);
    }

    if (clase != null) {
      this._service.getTipoAusentismos(clase).then(
        (resp) => {
          this.tipoAusentismosOptions = resp;
        }
      );
    }
  }

  private _hasSelectedIncapacidad(): boolean {
    let respose = false;
    const clase = this.form.get('claseAusentismoId').value;
    if (clase != null) {
      this._service.onClaseAusentismosChanged.value.forEach(element => {
        if (clase === element.id && element.codigo === ClaseAusentismoAlcanos.incapacidad) {
          respose = true;
        }
      });
    }

    return respose;
  }

  private _hasSelectedLicenciaRemunerada(): boolean {
    let respose = false;
    this.horas = false;
    const clase = this.form.get('claseAusentismoId').value;
    if (clase != null) {
      this._service.onClaseAusentismosChanged.value.forEach(element => {
        if (clase === element.id && element.codigo === ClaseAusentismoAlcanos.licenciaRemuneradaHoras) {
          respose = true;
          this.horas = true;
          this.form.get('horaInicio').setValidators([Validators.required]);
          this.form.get('horaFin').setValidators([Validators.required]);
        } else {
          this.form.get('horaInicio').clearValidators();
          this.form.get('horaInicio').setErrors(null);
          this.form.get('horaFin').clearValidators();
          this.form.get('horaFin').setErrors(null);
        }
      });
    }

    return respose;
  }


  private _getProrrogas(): void {
    const funcionario = this.form.get('funcionario').value;
    const clase = this.form.get('claseAusentismoId').value;
    let fecha = this.form.get('fechaInicio').value;
    this.prorrogaOptions = [];
    if (funcionario != null &&
      typeof funcionario === 'object'
      && clase != null
      && fecha != null) {
      if (moment.isMoment(fecha) === false) {
        fecha = moment(fecha);
      }
      this._service.getProrrogas(funcionario.id, clase, fecha.format()).then(
        resp => {
          this.prorrogaOptions = resp;
        }
      );
    }
  }

  private _guardarAusentismo(formValue): void {
    this.submit = true;
    const formValues = formValue;
    if (formValues.diagnosticoId != null) {
      formValues.diagnosticoId = formValues.diagnosticoId.id;
    }
    this._service.upsert(formValues)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/novedades/ausentismos`]);
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
          if ('funcionarioId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.funcionarioId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }
          if ('claseAusentismoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.claseAusentismoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('claseAusentismoId').setErrors(errors);
          }
          if ('tipoAusentismoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.tipoAusentismoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoAusentismoId').setErrors(errors);
          }
          if ('fechaInicio' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }
          if ('horaInicio' in resp.error.errors) {
            const errors = {};
            resp.error.errors.horaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('horaInicio').setErrors(errors);
          }
          if ('fechaFin' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFin').setErrors(errors);
          }
          if ('horaFin' in resp.error.errors) {
            const errors = {};
            resp.error.errors.horaFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('horaFin').setErrors(errors);
          }
          if ('prorrogaId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.prorrogaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('prorrogaId').setErrors(errors);
          }
          if ('numeroIncapacidad' in resp.error.errors) {
            const errors = {};
            resp.error.errors.numeroIncapacidad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('numeroIncapacidad').setErrors(errors);
          }
          if ('diagnosticoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.diagnosticoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('diagnosticoId').setErrors(errors);
          }

          if ('snack' in resp.error.errors) {
            let msg = '';
            resp.error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 3000
            });
          }

        }
      });
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    if (formValue.funcionario) {
      formValue.funcionarioId = formValue.funcionario.id;
    }

    if (this.fileToUpload !== null) {
      this._service.upload(this.fileToUpload).then(
        (fileResp) => {
          formValue.file = null;
          formValue.adjunto = fileResp.object_id;
          this._guardarAusentismo(formValue);
        }
      );
    } else {
      formValue.file = null;
      formValue.adjunto = (this.item != null) ? this.item.adjunto : null;
      this._guardarAusentismo(formValue);
    }

  }

  displayFn(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  displayFnDiagnostico(element: any): string {
    return element ? element.codigo + ' - ' + element.nombre : element;
  }


}
