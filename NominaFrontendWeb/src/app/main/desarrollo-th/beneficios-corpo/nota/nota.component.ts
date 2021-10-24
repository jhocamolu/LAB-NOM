import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { NotaService } from './nota.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'beneficios-corpo-nota',
  templateUrl: './nota.component.html',
  styleUrls: ['./nota.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class NotaComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<NotaComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: NotaService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      notaAcademica: [element.notaAcademica, [Validators.required, Validators.max(5), AlcanosValidators.decimal]],
      observacionNotaAcademica: [element.observacionNotaAcademica, []],
    });

  }

  ngOnInit(): void {
  }


  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  // get notaAcademica(): AbstractControl {
  //   return this.form.get('notaAcademica');
  // }
  // get observacionNotaAcademica(): AbstractControl {
  //   return this.form.get('observacionNotaAcademica');
  // }

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
          if ('notaAcademica' in resp.error.errors) {
            const errors = {};
            resp.error.errors.notaAcademica.forEach(element => {
              errors[element] = true;
            });
            this.form.get('notaAcademica').setErrors(errors);
          }
          if ('observacionNotaAcademica' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observacionNotaAcademica.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacionNotaAcademica').setErrors(errors);
          }

        }
      });
  }

}
