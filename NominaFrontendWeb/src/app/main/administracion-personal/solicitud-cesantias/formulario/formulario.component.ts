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
import { element } from 'protractor';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'solicitud-cesantias-formulario',
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

  datosCesantias: any;

  motivoSolicitudOptions: any[];

  desabilitar: boolean = false;

  fileToUpload: File | null;

  filteredFuncionarios: Observable<string[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: FormularioService,
  ) {
    this.fileToUpload = null;
    this.motivoSolicitudOptions = this._service.onMotivoSolicitudChanged.value;



    this.form = this._formBuilder.group({
      id: [null],
      funcionario: [null, [Validators.required]],
      motivoSolicitudCesantiaId: [null, [Validators.required]],
      valorSolicitado: [null, [Validators.required, Validators.min(1),  Validators.max(999999999)]],
      soporte: [null],
      observacion: [null],
      file: [null,Validators.required],
    });
    this.submit = false;
  }

  ngOnInit(): void {


    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;
        this.desabilitar = true;

        this._service.getDatosCesantias(this.item.funcionarioId).then((response) => {
          this.datosCesantias = response;
        });

        this.form.patchValue({
          id: this.item.id,
          funcionario: this.item.funcionario,
          motivoSolicitudCesantiaId: this.item.motivoSolicitudCesantiaId,
          valorSolicitado: this.item.valorSolicitado,
          // soporte: this.item.soporte,
          observacion: this.item.observacion,
        });
        // Desabilitar campos en el editar
        this.form.get('funcionario').disable();



        // this.form.get('motivoSolicitudCesantiaId').setValue(null);
      }
    });

    this.form.get('funcionario').valueChanges.subscribe(value => {
      if (value.id != undefined) {
        if (this.form.get('motivoSolicitudCesantiaId').value) {
          this.form.get('motivoSolicitudCesantiaId').setValue(null);
        }
        if (this.form.get('valorSolicitado').value) {
          this.form.get('valorSolicitado').setValue(null);
        }
        if (this.form.get('observacion').value) {
          this.form.get('observacion').setValue(null);
        }
      }

    });


    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );


  }


  focusData(event): void {
    if (this.form.value.funcionario) {
      if (Number.isInteger(this.form.value.funcionario.id)) {
        this._service.getDatosCesantias(this.form.value.funcionario.id).then((resp) => {
          this.datosCesantias = resp;
        });
      }
    }

    if (this.form.value.funcionario && this.form.value.funcionario.id) {
      this._service.getDatosActuales(this.form.value.funcionario.id)
        .then(resp => {
          const errors = {};
          if (resp != null) {
            if (resp.estado === 'Retirado') {
              errors[
                'El funcionario que intentas ingresar no se encuentra activo, por favor revise.'
              ] = true;
              this.form.get('funcionario').setErrors(errors);
            }
            if (resp.estado === 'Seleccionado') {
              errors[
                'El funcionario que intentas ingresar no se encuentra activo, por favor revise.'
              ] = true;
              this.form.get('funcionario').setErrors(errors);
            }
          }

        });

    }
  }


  ngAfterViewInit(): void {
  }

  get seletedFuncionario(): boolean {
    const value = this.form.get('funcionario').value;

    if (value != null && typeof value === 'object' && value.estado != 'Retirado' && value.estado != 'Seleccionado') {
      return true;
    }
    return false;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  soporteInputHandle(event): void {

    const errors = {};
    const validFileExtensions = ['pdf', 'png'];
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 5242880; // unidad de medida bits (5 Mb)

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

  displayFn(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  private _guardarCesantias(formValue): void {
    this.submit = true;
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/administracion-personal/solicitud-cesantias`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400) {
          this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'El Valor solicitado excede el valor máximo de anticipo a las cesantías.', time: 6000 });
        }

        if (resp.status === 404) {
          this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'El Valor solicitado excede el valor máximo de anticipo a las cesantías.', time: 6000 });
        }

        if (resp.status === 500) {
          this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'El Valor solicitado excede el valor máximo de anticipo a las cesantías.', time: 6000 });
        }

        if (resp.status === 400 && 'errors' in error) {

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            // localStorage.removeItem('idUser');

            // Asignar una llave porque siempre va a borrar todo
            // if (!this._service.id) {
            //   this.form.get('funcionario').setValue(null);
            //   this.form.get('motivoSolicitudCesantiaId').setValue(null);
            //   this.form.get('valorSolicitado').setValue(null);
            //   this.form.get('observacion').setValue(null);
            // }

            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000,
            });
          }

          if ('funcionarioId' in error.errors) {
            const errors = {};
            error.errors.funcionarioId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }

          if ('motivoSolicitudCesantiaId' in error.errors) {
            const errors = {};
            error.errors.motivoSolicitudCesantiaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('motivoSolicitudCesantiaId').setErrors(errors);
          }
          if ('valorSolicitado' in error.errors) {
            const errors = {};
            error.errors.valorSolicitado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valorSolicitado').setErrors(errors);
          }

          if ('soporte' in error.errors) {
            const errors = {};
            error.errors.soporte.forEach(element => {
              errors[element] = true;
            });
            this.form.get('soporte').setErrors(errors);
          }

          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }

          if ('file' in resp.error.errors) {
            const errors = {};
            resp.error.errors.file.forEach(element => {
              errors[element] = true;
            });
            this.form.get('file').setErrors(errors);
          }
        }

      });

  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    if (formValue.funcionario) {
      formValue.funcionarioId = formValue.funcionario.id;
    } else {
      formValue.funcionarioId = this.item.funcionarioId;
    }
    if (this.fileToUpload !== null) {
      this._service.upload(this.fileToUpload).then(
        (fileResp) => {
          formValue.file = null;
          formValue.soporte = fileResp.object_id;
          this._guardarCesantias(formValue);
        }
      );
    } else {
      formValue.file = null;
      formValue.soporte = (this.item != null) ? this.item.soporte : null;
      this._guardarCesantias(formValue);
    }
  }


}
