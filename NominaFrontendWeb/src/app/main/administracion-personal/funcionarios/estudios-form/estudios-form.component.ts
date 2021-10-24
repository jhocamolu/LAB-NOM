import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { EstudiosService } from './estudios-form.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'funcionarios-estudios-form',
  templateUrl: './estudios-form.component.html',
  styleUrls: ['./estudios-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class EstudiosFormComponent implements OnInit, AfterViewInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  itemFuncionario: any;
  itemEstudio: any | null;

  //
  nivelEducativos: any[];
  estadoEstudios: any[];
  paises: any[];
  profesiones: any[];

  filteredProfesiones: Observable<string[]>;

  /**
   * 
   * @param _formBuilder 
   * @param _matSnackBar 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: EstudiosService,
  ) {
    this.submit = false;
    this.itemFuncionario = this._service.itemFuncionario;
    this.nivelEducativos = this._service.onNivelEducativosChanged.value;
    this.estadoEstudios = this._service.estadoEstudios;
    this.paises = this._service.onPaisesChanged.value;
    this.profesiones = this._service.onProfesionesChanged.value;
    this.form = this._formBuilder.group({
      id: [null],
      funcionarioId: [this.itemFuncionario.id],
      nivelEducativoId: [null, [Validators.required]],
      institucionEducativa: [null, [Validators.required, AlcanosValidators.maxLength(255)]],
      estadoEstudio: [null, [Validators.required]],
      paisId: [null, [Validators.required]],
      anioDeInicio: [null, [Validators.required]],
      anioDeFin: [null, []],
      tarjetaProfesional: [null, [Validators.pattern('^[A-Z0-9\\s-_Ñ]+$'), AlcanosValidators.maxLength(20)]],
      profesion: [null, []],
      titulo: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      observacion: [null, []],
    }, { validators: this.validateEstudio });

  }


  ngOnInit(): void {

    this._service.onItemEstudioChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.itemEstudio = response;
          const paisId = this._inArray(this.itemEstudio.paisId, this.paises) ? this.itemEstudio.paisId : null;
          this.form.patchValue({
            id: this.itemEstudio.id,
            nivelEducativoId: this.itemEstudio.nivelEducativoId,
            institucionEducativa: this.itemEstudio.institucionEducativa,
            estadoEstudio: this.itemEstudio.estadoEstudio,
            paisId: paisId,
            anioDeInicio: this.itemEstudio.anioDeInicio,
            anioDeFin: this.itemEstudio.anioDeFin,
            tarjetaProfesional: this.itemEstudio.tarjetaProfesional,
            profesion: this.itemEstudio.profesion,
            titulo: this.itemEstudio.titulo,
            observacion: this.itemEstudio.observacion,
          });
          this._changeFechaFinal(this.itemEstudio.estadoEstudio);
          this.form.markAllAsTouched();
        }
      }
    );

    this.form.get('estadoEstudio').valueChanges.subscribe((item) => {
      this._changeFechaFinal(item);
    });

    this.filteredProfesiones = this.form.get('profesion')
      .valueChanges.pipe(
        startWith<string | any>(''),
        map(val => (typeof val === 'string' ? val : val.nombre)),
        map(view => (view ? this._filterProfesiones(view) : this.profesiones.slice())
        ),
      );

  }

  ngAfterViewInit(): void {

  }


  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateEstudio(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.anioDeInicio && value.anioDeFin) {
      formGroup.get('anioDeFin').setErrors(null);
      let anioDeInicio = value.anioDeInicio;
      let anioDeFin = value.anioDeFin;
      if (typeof anioDeInicio === 'string') {
        anioDeInicio = moment(anioDeInicio).toDate();
      } else {
        anioDeInicio = value.anioDeInicio.toDate();
      }

      if (typeof anioDeFin === 'string') {
        anioDeFin = moment(anioDeFin).toDate();
      } else {
        anioDeFin = value.anioDeFin.toDate();
      }

      if (anioDeInicio.getTime() > anioDeFin.getTime()) {
        const errors = {};
        errors['La fecha de finalización no puede ser menor a la fecha de inicio.'] = true;
        formGroup.get('anioDeFin').setErrors(errors);
      }

    }
    return null;
  }

 

  tabChangeHandle(event: MatTabChangeEvent): void {
    this._router.navigate([`/administracion-personal/funcionarios/${this.itemFuncionario.id}/mostrar`],
      { queryParams: { tab: event.index } });
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    if ('profesion' in formValue && formValue.profesion != null) {
      formValue.profesionId = formValue.profesion.id;
      formValue.profesion = null;
    }
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/administracion-personal/funcionarios/${this.itemFuncionario.id}/mostrar`],
          {
            queryParams: {
              tab: 2
            }
          }
        );
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
            this.form.get('nivelEducativoId').setErrors(errors);
          }

          if ('institucionEducativa' in error.errors) {
            const errors = {};
            error.errors.institucionEducativa.forEach(element => {
              errors[element] = true;
            });
            this.form.get('institucionEducativa').setErrors(errors);
          }

          if ('anioDeFin' in error.errors) {
            const errors = {};
            error.errors.anioDeFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('anioDeFin').setErrors(errors);
          }

          if ('anioDeInicio' in error.errors) {
            const errors = {};
            error.errors.anioDeInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('anioDeInicio').setErrors(errors);
          }

          if ('tarjetaProfesional' in error.errors) {
            const errors = {};
            error.errors.tarjetaProfesional.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tarjetaProfesional').setErrors(errors);
          }

          if ('profesionId' in error.errors) {
            const errors = {};
            error.errors.profesionId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('profesion').setErrors(errors);
          }

          if ('titulo' in error.errors) {
            const errors = {};
            error.errors.titulo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('titulo').setErrors(errors);
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

  displayFn(element: any): string {
    return element ? element.nombre : element;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }


  private _filterProfesiones(value: any): any[] {
    return this.profesiones.filter(option => option.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }

  private _changeFechaFinal(id: string): void {
    let obj = null;
    this.estadoEstudios.forEach(element => {
      if (`${element.id}` === `${id}`) {
        obj = element;
      }
    });
    if (obj != null && !obj.fechaFinalEnabled) {
      this.form.get('anioDeFin').setValue(null);
      this.form.get('anioDeFin').disable();
    } else {
      this.form.get('anioDeFin').enable();
    }

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
