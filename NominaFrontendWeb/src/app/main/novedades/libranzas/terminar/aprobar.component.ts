import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { TerminarService } from './aprobar.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoLibranzasAlcanos  } from '@alcanos/constantes/estado-libranzas';
@Component({
  selector: 'libranza-terminar',
  templateUrl: './aprobar.component.html',
  styleUrls: ['./aprobar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class TerminarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  estadoLibranzasAlcanosVar = estadoLibranzasAlcanos; 
  constructor(
    public dialogRef: MatDialogRef<TerminarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: TerminarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, [Validators.required]],
      justificacion: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;

    this._service.estado(this.element.id, formValue)
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


}
