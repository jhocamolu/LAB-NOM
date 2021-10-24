import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearRetefuenteService } from './crear-retefuente.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'funcionarios-crear-retefuente',
  templateUrl: './crear-retefuente.component.html',
  styleUrls: ['./crear-retefuente.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearRetefuenteComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  id: number;
  annoOptions: any[];
  funcionarioId: number;

  constructor(
    public dialogRef: MatDialogRef<CrearRetefuenteComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearRetefuenteService,
  ) {
    this.funcionarioId = element.funcionarioId;
    this.form = this._formBuilder.group({
      id: [null],
      annoVigenciaId: [null, [Validators.required]],
      interesVivienda: [null, [Validators.required, Validators.max(100000000)]],
      medicinaPrepagada: [null, [Validators.required, Validators.max(100000000)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.getAnnoLista().then(resp => {
      this.annoOptions = resp;
    });
  
  }

 

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {

    this.submit = true;
    const formValue = this.form.value;
    formValue.funcionarioId = this.funcionarioId;
    this._service.crear(formValue)
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
          if ('annoVigenciaId' in error.errors) {
            const errors = {};
            error.errors.annoVigenciaId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('annoVigenciaId').setErrors(errors);
          }
          if ('interesVivienda' in error.errors) {
            const errors = {};
            error.errors.interesVivienda.forEach(element => {
              errors[element] = true;
            });
            this.form.get('interesVivienda').setErrors(errors);
          }
          if ('medicinaPrepagada' in error.errors) {
            const errors = {};
            error.errors.medicinaPrepagada.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('medicinaPrepagada').setErrors(errors);
          }
        }
      });
  }

}
