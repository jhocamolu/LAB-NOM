import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { tipoHoraExtra } from '@alcanos/constantes/tipo-hora-extra';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'horas-extras-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {


  form: FormGroup;
  submit: boolean;

  tipoHoraExtra = tipoHoraExtra;

  conceptoNominaOptions: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      tipo: [element.tipo, [Validators.required]],
      conceptoNominaId: [element.conceptoNomina, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this.conceptoNominaOptions = this.form.get('conceptoNominaId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFnConceptos(element: any): string {
    return element ? `${element.codigo} - ${element.nombre}` : element;
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.conceptoNominaId = formValue.conceptoNominaId.id;

    this._service.editar(this.element.id, formValue)
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
          if ('tipo' in error.errors) {
            const errors = {};
            error.errors.tipo.forEach(element => {
              errors['Error'] = true;
            });
            this.form.get('tipo').setErrors(errors);
          }
          if ('conceptoNominaId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaId.forEach(element => {
              errors['Error'] = true;
            });
            this.form.get('conceptoNominaId').setErrors(errors);
          }
          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 7000,
            });
          }

        }
      });
  }

}
