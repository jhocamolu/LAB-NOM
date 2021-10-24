import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';

import * as moment from 'moment';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
import { modulosCategoriaNovedades, ubicacionTerceroCategoriaNovedades } from '@alcanos/constantes/categoria-novedades';

@Component({
  selector: 'categoria-novedades-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;

  indefinido: boolean;
  usaParametrizacion: any[];

  modulos = modulosCategoriaNovedades;
  ubicacionTercero = ubicacionTerceroCategoriaNovedades;

  conceptoNominaOptions: Observable<string[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,
  ) {
    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(60), AlcanosValidators.alfabetico]],
      usaParametrizacion: [null, [Validators.required]],
      conceptoNominaId: [null, [Validators.required]],
      modulo: [null, [Validators.required]],
      clase: [null, [Validators.required]],
      requiereTercero: [null, [Validators.required]],
      ubicacionTercero: [null, [Validators.required]],
      valorEditable: [null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {

    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {

        this.item = resp;
        this.id = this.item.id;


        this.form.patchValue({
          id: this.item.id,
          nombre: this.item.nombre,
          usaParametrizacion: this.item.usaParametrizacion,
          modulo: this.item.modulo,
          clase: this.item.clase,
          requiereTercero: this.item.requiereTercero,
          ubicacionTercero: this.item.ubicacionTercero,
          valorEditable: this.item.valorEditable,
          conceptoNominaId: this.item.conceptoNomina,
        });

        if (this.item.usaParametrizacion === false) {
          this.form.get('conceptoNominaId').disable();
          this.form.get('conceptoNominaId').setValue(null);
        }

        if (this.item.requiereTercero === false) {
          this.form.get('ubicacionTercero').disable();
          this.form.get('ubicacionTercero').setValue(null);
        }

        this.form.markAllAsTouched();
      }
    });

    this.conceptoNominaOptions = this.form.get('conceptoNominaId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );
    
    this.form.get('usaParametrizacion').valueChanges.subscribe(value => {
      if (value === true) {
        this.form.get('conceptoNominaId').enable();
        this.form.get('conceptoNominaId').setValue(null);
      } else {
        this.form.get('conceptoNominaId').disable();
        this.form.get('conceptoNominaId').setValue(null);
      }
    });

    this.form.get('requiereTercero').valueChanges.subscribe(value => {
      if (value === true) {
        this.form.get('ubicacionTercero').enable();
        this.form.get('ubicacionTercero').setValue(null);
      } else {
        this.form.get('ubicacionTercero').disable();
        this.form.get('ubicacionTercero').setValue(null);
      }
    });
  }

  ngAfterViewInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFnConceptos(element: any): string {
    return element ? `${element.codigo} - ${element.nombre}` : element;
  }

  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.conceptoNominaId != null && typeof value.conceptoNominaId !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un concepto asociado.'] = true;
      formGroup.get('conceptoNominaId').setErrors(errors);
    }

    return null;
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    if (formValue.conceptoNominaId) {
    formValue.conceptoNominaId = formValue.conceptoNominaId.id;
    } else {
      formValue.conceptoNominaId = null;
    }

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/configuracion/categoria-novedades`]);
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
          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }

          if ('usaParametrizacion' in error.errors) {
            const errors = {};
            error.errors.usaParametrizacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('usaParametrizacion').setErrors(errors);
          }
          if ('modulo' in error.errors) {
            const errors = {};
            error.errors.modulo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('modulo').setErrors(errors);
          }
          if ('clase' in error.errors) {
            const errors = {};
            error.errors.clase.forEach(element => {
              errors[element] = true;
            });
            this.form.get('clase').setErrors(errors);
          }
          if ('requiereTercero' in error.errors) {
            const errors = {};
            error.errors.requiereTercero.forEach(element => {
              errors[element] = true;
            });
            this.form.get('requiereTercero').setErrors(errors);
          }
          if ('ubicacionTercero' in error.errors) {
            const errors = {};
            error.errors.ubicacionTercero.forEach(element => {
              errors[element] = true;
            });
            this.form.get('ubicacionTercero').setErrors(errors);
          }

          if ('ubicacionTercero' in error.errors) {
            const errors = {};
            error.errors.ubicacionTercero.forEach(element => {
              errors[element] = true;
            });
            this.form.get('ubicacionTercero').setErrors(errors);
          }

          if ('conceptoNominaId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaId').setErrors(errors);
          }

        }
      });

  }

}
