import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'grupo-nominas-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      nombre: [element.nombre, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.codigo = this.element.codigo;
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
        }
      });

  }
}
