import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FirmaGrupoFormService } from './firma-grupo-form.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
  selector: 'firma-grupo-form',
  templateUrl: './firma-grupo-form.component.html',
  styleUrls: ['./firma-grupo-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FirmaGrupoFormComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  edit: any;
  grupodocumentosOptions: any[] = [];
  filteredFuncionarios: Observable<string[]>;
  grupodoc: any;
  _router: any;

  constructor(
    public dialogRef: MatDialogRef<FirmaGrupoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: FirmaGrupoFormService,
  ) {
    this.submit = false;
    this.grupodocumentosOptions = this._service.onGrupoDocumentosChanged.value;
    if (element != null) {
      this.edit = element;
      this._service.getResultado(element);
    } else {
      this._service.getResultado(null);
    }
    this.form = this._formBuilder.group({
      id: [null],
      funcionario: [null, [Validators.required]],
      grupodocumentoSlug: [null, [Validators.required]],
      fechaInicio: [null, [Validators.required]],
      fechaFin: [null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectGrupoDocumentos();
    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;

        this.form.patchValue({
          id: this.item.id,
          funcionario: this.item.funcionario,
          grupodocumentoSlug: this.item.grupoDocumentoSlug,
          fechaInicio: this.item.fechaInicio,
          fechaFin: this.item.fechaFin,

        });
        this.form.markAllAsTouched();
      }
    });

    this.form.get('grupodocumentoSlug').valueChanges.subscribe(value => {
      // this.form.get('fechaInicio').setErrors(null);
      // this.form.get('fechaFin').setErrors(null);
    });

    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );
  }

  public selectGrupoDocumentos(): void {
    this._service.getGrupoDocumentosLista().then(
      (resp: any[]) => {
        this.grupodocumentosOptions = resp;
      });
  }

  displayFnFuncionarios(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

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
      }
    }

    return null;
  }


  guardarHandle(event): void {

    this.submit = true;
    const formValue = this.form.value;
    formValue.funcionarioId = formValue.funcionario.id;
    this._service.upsert(formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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
            const errors = {};
            error.errors.snackError.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 9000
              });
            });
          }
          if ('funcionario' in error.errors) {
            const errors = {};
            error.errors.funcionario.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }
          if ('grupodocumentoSlug' in error.errors) {
            const errors = {};
            error.errors.grupodocumentoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('grupodocumentoSlug').setErrors(errors);
          }
          if ('fechaInicio' in error.errors) {
            const errors = {};
            error.errors.fechaInicio.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }
          if ('fechaFin' in error.errors) {
            const errors = {};
            error.errors.fechaFin.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('fechaFin').setErrors(errors);
          }

        }
      });
  }
}
