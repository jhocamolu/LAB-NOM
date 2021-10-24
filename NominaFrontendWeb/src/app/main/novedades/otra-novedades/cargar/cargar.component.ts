import { Component, OnInit, Inject, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { CargarService } from './cargar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';

import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { InformacionComponent } from '../informacion/informacion.component';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { otrasNovedadesArchivos } from '@alcanos/constantes/otras-novedades-urls';
import * as moment from 'moment';

@Component({
   selector: 'otras-novedades-cargar',
   templateUrl: './cargar.component.html',
   styleUrls: ['./cargar.component.scss'],
   animations: fuseAnimations,
   encapsulation: ViewEncapsulation.None
})
export class CargarComponent implements OnInit {
   form: FormGroup;
   submit: boolean;
   dependenciasOptions: any[] = [];
   nivelCargoOptions: any[] = [];
   unidadMedida: any;
   otrasNovedadesFiles = otrasNovedadesArchivos;
   requiereCantidades: boolean;
   requiereTercero: boolean;
   disabled: boolean;
   fileToUpload: File | null;
   item: any;
   evaluacion: boolean;
   finalFile: any;
   periodoContable: any;
   nombreNovedad: any;
   categoriaNovedad: any;
   // periodicidad
   subPeriodos: any[];

   // periodos
   tipoPeriodos: any;

   filteredNovedades: Observable<string[]>;

   spinner: boolean;

   @Input() filename: any = 'download';

   constructor(
      private _formBuilder: FormBuilder,
      private _alcanosSnackBar: AlcanosSnackBarService,
      private _matDialog: MatDialog,
      private _service: CargarService,
      private _router: Router
   ) {
      this.spinner = false;
      this.fileToUpload = null;

      this.form = this._formBuilder.group({
         categoriaNovedadId: [null, [Validators.required]],
         fechaAplicacion: [null, [Validators.required]],
         tipoPeriodoId: [null, [Validators.required]],
         subPeriodoId: [null, [Validators.required]],
         file: [null, [Validators.required]],
      });

      this.submit = false;
      this.disabled = true;
      this.evaluacion = false;
   }

   ngOnInit(): void {

      this._service.getTipoPeriodos().then(resp => {
         this.tipoPeriodos = resp;
      });

      this._service.getPeriodoContable().then(resp => {
         this.periodoContable = resp[0].fecha;
      });

      this.form.get('tipoPeriodoId').valueChanges.subscribe(value => {
         this.subPeriodos = [];
         this.form.get('subPeriodoId').setValue(null);
         if (value != null) {
            this._periodicidad(value);
         }
      });

      this.filteredNovedades = this.form.get('categoriaNovedadId')
         .valueChanges
         .pipe(
            debounceTime(300),
            switchMap(value => this._service.getNovedades(value))
         );

      this.form.get('categoriaNovedadId').valueChanges.subscribe(
         (value) => {
            if (typeof value === 'object') {
               this.requiereCantidades = value.conceptoNomina.requiereCantidad;
               this.requiereTercero = value.requiereTercero;
               this.disabled = false;
            } else {
               this.disabled = true;
            }
            this.unidad(value.conceptoNomina);
         }
      );

      this.form.get('fechaAplicacion').valueChanges.subscribe(value => {
         if (value !== null) {
            const mesPeriodoContable = moment(this.periodoContable).format('M');
            const anioPeriodoContable = moment(this.periodoContable).format('YYYY');
            const mesInsertado = moment(value).format('M');
            const anioInsertado = moment(value).format('YYYY');
            if (mesPeriodoContable != mesInsertado || anioPeriodoContable != anioInsertado) {
               const errors = {};
               errors['¿La fecha que intentas ingresar no se encuentra dentro del periodo de liquidación de nómina vigente (' + moment(this.periodoContable).format('M/YYYY') + ')?.'] = true;
               this.form.get('fechaAplicacion').setErrors(errors);
            }
         }
      });
   }

   unidad(unidad: any): void {
      if (unidad != null) {
         this.unidadMedida = unidad.unidadMedida;
      }
   }

   private _periodicidad(periodicidadId): void {
      this._service.getSubPeriodos(periodicidadId).then((response: any[]) => {
         this.subPeriodos = response;
      });
   }

   informacionHandle(formValue, resp): void {
      const dialogRef = this._matDialog.open(InformacionComponent, {
         panelClass: 'modal-dialog',
         disableClose: true,
         data: {
            enviados: formValue,
            recibidos: resp
         }
      });
      dialogRef.afterClosed().subscribe(result => {
         if (result === true) {
            this.evaluacion = true;
            this._guardarNovedadCargar(formValue);
         } else {
            this._router.navigate(['/novedades/otra-novedades']);
         }
      });
   }

   typeFiles(event): void {

      if (this.requiereCantidades === true && this.requiereTercero === false) {
         window.open(this.otrasNovedadesFiles.cedulaCantidad, '_blank');
      }
      if (this.requiereCantidades === false && this.requiereTercero === false) {
         window.open(this.otrasNovedadesFiles.cedulaValor, '_blank');
      }

      if (this.requiereCantidades === true && this.requiereTercero === true) {
         window.open(this.otrasNovedadesFiles.cedulaCantidadNitTercero, '_blank');
      }

      if (this.requiereCantidades === false && this.requiereTercero === true) {
         window.open(this.otrasNovedadesFiles.cedulaValorNitTercero, '_blank');
      }
   }

   fileInputHandle(event): void {
      let extension = null;
      let maxFileSize = null;
      const errors = {};
      const validFileExtensions = ['xls', 'xlsx'];
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


   get categoriaNovedadId(): AbstractControl {
      return this.form.get('categoriaNovedadId');
   }

   get fechaAplicacion(): AbstractControl {
      return this.form.get('fechaAplicacion');
   }

   get tipoPeriodoId(): AbstractControl {
      return this.form.get('tipoPeriodoId');
   }

   get subPeriodoId(): AbstractControl {
      return this.form.get('subPeriodoId');
   }
   get costoSicom(): AbstractControl {
      return this.form.get('costoSicom');
   }
   get file(): AbstractControl {
      return this.form.get('file');
   }

   guardarHandle(event): void {
      this.submit = true;
      const formValue = this.form.value;
      if (formValue.categoriaNovedadId) {
         formValue.categoriaNovedadGet = formValue.categoriaNovedadId;
         formValue.categoriaNovedadId = formValue.categoriaNovedadId.id;

         if (typeof formValue.categoriaNovedadGet === 'object') {
            this.categoriaNovedad = formValue.categoriaNovedadGet;
         }
      }

      if (formValue.categoriaNovedadId === undefined) {
         formValue.categoriaNovedadGet = this.categoriaNovedad;
         formValue.categoriaNovedadId = this.categoriaNovedad.id;
      }

      if (typeof formValue.subPeriodoId != 'string') {
         const array2 = [];
         const arraySubperiodo = [];
         if (formValue.subPeriodoId != null) {
            formValue.subPeriodoId.forEach(element => {
               this._service.getSubPeriodoSolo(element).then(resp => {
                  arraySubperiodo.push(resp);
               });
               array2.push(element);
            });
            formValue.periodicidadCompleto = arraySubperiodo;
            formValue.periodicidad = array2;
         }
      }

      formValue.periodoPagoId = formValue.tipoPeriodoId;
      formValue.fechaAplicacionGet = formValue.fechaAplicacion;
      formValue.fechaAplicacion = moment(formValue.fechaAplicacion).format('YYYY-MM-DD');
      formValue.validar = this.evaluacion;

      this._guardarNovedadCargar(formValue);
   }

   _guardarNovedadCargar(formValue): void {
      this.spinner = true;
      const formData: any = new FormData();
      this._alcanosSnackBar.snackbar({ clase: 'informativo', mensaje: 'Se ha iniciado el proceso de cargue/lectura' });

      formData.append('archivo', this.fileToUpload);
      formData.append('categoriaNovedadId', formValue.categoriaNovedadId);
      formData.append('fechaAplicacion', formValue.fechaAplicacion);
      formData.append('periodoPagoId', formValue.periodoPagoId);

      if (formValue.periodicidad.length > 0) {
         formValue.periodicidad.forEach(element => {
            formData.append('periodicidad', element);
         });
      }

      formData.append('validar', this.evaluacion);

      this.submit = true;
      this._service.cargar(formData, this.evaluacion)
         .then((resp) => {
            this.submit = false;
            if (!this.evaluacion) {
               this.informacionHandle(formValue, resp);
               this.spinner = false;
            } else {
               // window.open(window.URL.createObjectURL(resp));
               const a = document.createElement('a');
               const file = new Blob([resp], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
               const fileURL = URL.createObjectURL(file);
               a.download = `${formValue.categoriaNovedadGet.nombre}${moment().format('YYYYDDMMhhmmss')}.xlsx`;
               a.href = fileURL;
               document.body.appendChild(a);
               a.click();
               document.body.removeChild(a);
               this.evaluacion = false; 
               this._alcanosSnackBar.snackbar({
                  clase: 'exito',
                  mensaje: 'Se presentaron inconsistencias en el cargue de novedades de algunos funcionarios ver archivo descargado.',
                  time: 8000
               });
               this.spinner = false;
               this._router.navigate([`/novedades/otra-novedades/cargar`]);
            }
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
               if ('categoriaNovedadId' in error.errors) {
                  const errores = {};
                  error.errors.categoriaNovedadId.forEach(element => {
                     errores[element] = true;
                  });
                  this.categoriaNovedadId.setErrors(errores);
               }
               if ('fechaAplicacion' in error.errors) {
                  const errores = {};
                  error.errors.fechaAplicacion.forEach(element => {
                     errores[element] = true;
                  });
                  this.fechaAplicacion.setErrors(errores);
               }
               if ('periodoPagoId' in error.errors) {
                  const errores = {};
                  error.errors.periodoPagoId.forEach(element => {
                     errores[element] = true;
                  });
                  this.tipoPeriodoId.setErrors(errores);
               }
               if ('periodicidad' in error.errors) {
                  const errores = {};
                  error.errors.periodicidad.forEach(element => {
                     errores[element] = true;
                  });
                  this.subPeriodoId.setErrors(errores);
               }
               if ('validar' in error.errors) {
                  const errores = {};
                  error.errors.validar.forEach(element => {
                     errores[element] = true;
                  });
                  this.categoriaNovedadId.setErrors(errores);
               }
               if ('archivo' in error.errors) {
                  const errores = {};
                  error.errors.archivo.forEach(element => {
                     errores[element] = true;
                  });
                  this.file.setErrors(errores);
               }

               if ('dialogoError' in error.errors) {
                  const errors = {};
                  error.errors.dialogoError.forEach(element => {
                     this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: element,
                        time: 6000
                     });
                  });
                  this.spinner = false;
               }

               if ('dialogoExito' in error.errors) {
                  const errors = {};
                  error.errors.dialogoExito.forEach(element => {
                     this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: element,
                        time: 6000
                     });
                  });
               }

               this.spinner = false;
            }
            if (resp.status === 204 && 'errors' in error) {
               if ('dialogoExito' in error.errors) {
                  const errors = {};
                  error.errors.dialogoExito.forEach(element => {
                     this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: element,
                        time: 6000
                     });
                  });
                  this.spinner = false;
               }
            }
         });
   }

   displayFnNovedades(element: any): string {
      return element ? element.nombre : element;
   }

}
