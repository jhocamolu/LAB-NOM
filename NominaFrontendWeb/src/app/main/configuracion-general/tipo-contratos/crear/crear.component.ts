import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'tipo-contrato-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  documentosSlug:any;
  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService
  ) {
    this._service.getDocumentos().then(documentos => {
      this.documentosSlug = documentos.value
    })
    this.form = this._formBuilder.group({
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(60)]],
      clase: [null, [Validators.required]],
      cantidadProrrogas: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(0), Validators.max(10)]],
      duracionMaxima: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(0), Validators.max(99999)]],
      terminoIndefinido: [null, [Validators.required]],
      documentoSlug: [null],
    });
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

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        this.dialogRef.close(true);
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
            const errors = {};
            error.errors.cantidadProrrogas.forEach(element => {
              errors[element] = true;
            });
            this.cantidadProrrogas.setErrors(errors);
          }

          if ('duracionMaxima' in error.errors) {
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

          // if ('documentoSlug' in error.errors) {
          //   const errors = {};
          //   error.errors.documentoSlug.forEach(element => {
          //     errors[element] = true;
          //   });
          //   this.documentoSlug.setErrors(errors);
          // }
        }
      });

  }


}
