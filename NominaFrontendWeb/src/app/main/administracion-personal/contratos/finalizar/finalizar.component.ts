import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FinalizarService } from './finalizar.service';
import * as moment from 'moment';

@Component({
  selector: 'contratos-finalizar',
  templateUrl: './finalizar.component.html',
  styleUrls: ['./finalizar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FinalizarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  causalTerminaciones: any[];

  constructor(
    public dialogRef: MatDialogRef<FinalizarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: FinalizarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      fechaTerminacion: [null, Validators.required],
      causalTerminacionId: [null, Validators.required],
      observacionFinalizacionContrato: [null, Validators.required],
    });

    this._service.getCausalTerminaciones().then(resp => {
      this.causalTerminaciones = resp;
    });
  }

  ngOnInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.fechaTerminacion = moment(formValue.fechaTerminacion).format('YYYY-MM-DDTHH:mm:ssZ');
    this._service.finalizar(this.element.id, formValue)
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
          if ('fechaTerminacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fechaTerminacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaTerminacion').setErrors(errors);
          }
          if ('causalTerminacionId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.causalTerminacionId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('causalTerminacionId').setErrors(errors);
          }
          if ('observacionFinalizacionContrato' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observacionFinalizacionContrato.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacionFinalizacionContrato').setErrors(errors);
          }
        }
      });
  }

}
