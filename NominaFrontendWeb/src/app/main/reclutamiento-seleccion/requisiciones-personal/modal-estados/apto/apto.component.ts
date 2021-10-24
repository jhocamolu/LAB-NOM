import { Component, OnInit, Inject, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { EstadosService } from '../estados.service';
import { SeleccionadosListarService } from '../../seleccionados/listar/listar.service';

@Component({
  selector: 'modal-estados-apto',
  templateUrl: './apto.component.html',
  styleUrls: ['./apto.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AptoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  item: any;

  fileToUpload: File | null;

  constructor(
    public dialogRef: MatDialogRef<AptoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EstadosService,
    private _service2: SeleccionadosListarService,
  ) {
    this.fileToUpload = null;

    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, Validators.required],
      justificacion: [null, []],
      file: [null, [Validators.required]],
    }, { validators: this.validate });
  }

  ngOnInit(): void {
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
    if (value.estado === 'NoApto' && !value.justificacion) {
      formGroup.get('justificacion').setErrors({ 'required': true });
    } else {
      formGroup.get('justificacion').setErrors(null);

    }
    formGroup.get('justificacion').markAllAsTouched();
    return null;
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  fileInputHandle(event): void {
    const errors = {};
    const validFileExtensions = ['pdf'];
    const extension = event.target.files[0].name.split('.').pop();
    const maxFileSize = 10485760; // unidad de medida bits (10 Mb)

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


  private _guardarHandle(formValue): void {
    this.submit = true;
    // const formValue = this.form.value;
    this._service.estado(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        const queryParams = {
          $filter: 'true'
        };
        this._service2.buildFilter(queryParams);
        
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
          if ('file' in resp.error.errors) {
            const errors = {};
            resp.error.errors.file.forEach(element => {
              errors[element] = true;
            });
            this.form.get('file').setErrors(errors);
          }
          if ('estado' in resp.error.errors) {
            const errors = {};
            resp.error.errors.estado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }
          if ('justificacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.justificacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('justificacion').setErrors(errors);
          }
        }
      });
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    if (this.fileToUpload !== null) {
      this._service.upload(this.fileToUpload).then(
        (fileResp) => {
          formValue.file = null;
          formValue.AdjuntoExamen = fileResp.object_id;
          this._guardarHandle(formValue);
        }
      );
    } else {
      formValue.file = null;
      formValue.AdjuntoExamen = (this.item != null) ? this.item.AdjuntoExamen : null;
      this._guardarHandle(formValue);
    }
  }


}
