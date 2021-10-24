import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { ExperienciasService } from './experiencias-form.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'funcionarios-experiencias-form',
  templateUrl: './experiencias-form.component.html',
  styleUrls: ['./experiencias-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ExperienciasFormComponent implements OnInit {

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  itemFuncionario: any;
  itemExperiencia: any | null;


  /**
   * 
   * @param _formBuilder 
   * @param _alcanosSnackBar 
   * @param _router 
   * @param _matDialog 
   * @param _service 
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _matDialog: MatDialog,
    private _service: ExperienciasService,
  ) {
    this.submit = false;
    this.itemFuncionario = this._service.itemFuncionario;

    this.form = this._formBuilder.group({
      id: [null],
      funcionarioId: [this.itemFuncionario.id],
      nombreCargo: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      nombreEmpresa: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(255)]],
      telefono: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1000000), Validators.max(9999999999)]],
      salario: [null, [AlcanosValidators.numerico, Validators.max(9999999999)]],
      nombreJefeInmediato: [null, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      trabajaActualmente: [null, []],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, []],
      funcionesCargo: [null, []],
      motivoRetiro: [null, []],
      observaciones: [null, []],
    }, { validator: this.validateExperiencias });

  }

  ngOnInit(): void {
    this._service.onItemExperienciaChanged.subscribe(
      (response: any) => {
        if (response != null) {
          this.itemExperiencia = response;
          this.form.patchValue({
            id: this.itemExperiencia.id,
            nombreCargo: this.itemExperiencia.nombreCargo,
            nombreEmpresa: this.itemExperiencia.nombreEmpresa,
            telefono: this.itemExperiencia.telefono,
            salario: this.itemExperiencia.salario,
            nombreJefeInmediato: this.itemExperiencia.nombreJefeInmediato,
            fechaInicio: this.itemExperiencia.fechaInicio,
            fechaFin: this.itemExperiencia.fechaFin,
            funcionesCargo: this.itemExperiencia.funcionesCargo,
            trabajaActualmente: this.itemExperiencia.trabajaActualmente,
            motivoRetiro: this.itemExperiencia.motivoRetiro,
            observaciones: this.itemExperiencia.observaciones,
          });
          this._changeFechaFinal(this.itemExperiencia.trabajaActualmente);
          this.form.markAllAsTouched();
        }
      }
    );
    this.form.get('trabajaActualmente').valueChanges.subscribe((item) => {
      this._changeFechaFinal(item);
    });



  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateExperiencias(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.fechaInicio && value.fechaFin) {
      formGroup.get('fechaFin').setErrors(null);
      let fechaInicio = value.fechaInicio;
      let fechaFin = value.fechaFin;
      if (typeof fechaInicio === 'string') {
        fechaInicio = new Date(fechaInicio);
      } else {
        fechaInicio = value.fechaInicio.toDate();
      }

      if (typeof fechaFin === 'string') {
        fechaFin = new Date(fechaFin);
      } else {
        fechaFin = value.fechaFin.toDate();
      }


      if (fechaInicio.getTime() > fechaFin.getTime()) {
        const errors = {};
        errors['La fecha de finalización no debe ser menor a la fecha de inicio.'] = true;
        formGroup.get('fechaFin').setErrors(errors);
      }

    }

    return null;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
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
        this._router.navigate(
          [`/administracion-personal/funcionarios/${this.itemFuncionario.id}/mostrar`],
          {
            queryParams: {
              tab: 3
            }
          }
        );
        this.submit = false;
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {

          if ('nombreCargo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombreCargo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombreCargo').setErrors(errors);
          }

          if ('telefono' in resp.error.errors) {
            const errors = {};
            resp.error.errors.telefono.forEach(element => {
              errors[element] = true;
            });
            this.form.get('telefono').setErrors(errors);
          }

          if ('salario' in resp.error.errors) {
            const errors = {};
            resp.error.errors.salario.forEach(element => {
              errors[element] = true;
            });
            this.form.get('salario').setErrors(errors);
          }

          if ('nombreJefeInmediato' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombreJefeInmediato.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombreJefeInmediato').setErrors(errors);
          }

          if ('fechaInicio' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }

          if ('fechaFin' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFin').setErrors(errors);
          }

          if ('funcionesCargo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.funcionesCargo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionesCargo').setErrors(errors);
          }

          if ('motivoRetiro' in resp.error.errors) {
            const errors = {};
            resp.error.errors.motivoRetiro.forEach(element => {
              errors[element] = true;
            });
            this.form.get('motivoRetiro').setErrors(errors);
          }

          if ('observaciones' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observaciones.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observaciones').setErrors(errors);
          }

        }
      });
  }

  private _changeFechaFinal(disabled: boolean | string): void {
    if (`${disabled}` === 'true') {
      this.form.get('fechaFin').setValue(null);
      this.form.get('fechaFin').disable();
    } else {
      this.form.get('fechaFin').enable();
    }

  }


}
