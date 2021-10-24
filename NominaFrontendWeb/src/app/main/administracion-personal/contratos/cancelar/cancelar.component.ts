import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CancelarService } from './cancelar.service';

@Component({
  selector: 'contratos-cancelar',
  templateUrl: './cancelar.component.html',
  styleUrls: ['./cancelar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CancelarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<CancelarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CancelarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      cancelar: [null, Validators.required],
      justificacion: [null, Validators.required],
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
    this._service.cancelar(this.element.id, formValue)
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
          if ('cancelar' in resp.error.errors) {
            const errors = {};
            resp.error.errors.cancelar.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cancelar').setErrors(errors);
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

}
