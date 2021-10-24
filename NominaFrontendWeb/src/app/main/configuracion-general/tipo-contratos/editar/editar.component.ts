import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { CrearService } from '../crear/crear.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'tipo-contratos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  documentosSlug:any;
  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
    private _servicePrincipal : CrearService
  ) {
    this._servicePrincipal.getDocumentos().then(documentos => {
      this.documentosSlug = documentos.value
    })
    this.form = this._formBuilder.group({
      id: [element.id],
      nombre: [element.nombre, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(60)]],
      clase: [element.clase, [Validators.required]],
      cantidadProrrogas: [element.cantidadProrrogas, [Validators.required, AlcanosValidators.numerico, Validators.min(0), Validators.max(10)]],
      duracionMaxima: [element.duracionMaxima, [Validators.required, AlcanosValidators.numerico, Validators.min(0), Validators.max(99999)]],
      terminoIndefinido: [element.terminoIndefinido, [Validators.required]],
      documentoSlug: [element.documentoSlug],

    });
    this.form.markAllAsTouched();
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get clase(): AbstractControl {
    return this.form.get('clase');
  }
  get cantidadProrrogas(): AbstractControl {
    return this.form.get('cantidadProrrogas');
  }
  get duracionMaxima(): AbstractControl {
    return this.form.get('duracionMaxima');
  }
  get terminoIndefinido(): AbstractControl {
    return this.form.get('terminoIndefinido');
  }
  get documentoSlug(): AbstractControl {
    return this.form.get('documentoSlug');
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.editar(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(resp);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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
          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }
          if ('clase' in error.errors) {
            const errors = {};
            error.errors.clase.forEach(element => {
              errors[element] = true;
            });
            this.clase.setErrors(errors);
          }
          if ('cantidadProrrogas' in error.errors) {
            this.cantidadProrrogas.markAsDirty();
            const errors = {};
            error.errors.cantidadProrrogas.forEach(element => {
              errors[element] = true;
            });
            this.cantidadProrrogas.setErrors(errors);
          }
          if ('duracionMaxima' in error.errors) {
            this.duracionMaxima.markAsDirty();
            const errors = {};
            error.errors.duracionMaxima.forEach(element => {
              errors[element] = true;
            });
            this.duracionMaxima.setErrors(errors);
          }
          if ('terminoIndefinido' in error.errors) {
            const errors = {};
            error.errors.terminoIndefinido.forEach(element => {
              errors[element] = true;
            });
            this.terminoIndefinido.setErrors(errors);

          }
        }
      });

  }

}
