import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'dependencias-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  dependenciaOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService
  ) {

    this.form = this._formBuilder.group({
      codigo: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(10)]],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(255)]],
      dependenciaPadreId: [null],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectPadres();
  }

  public selectPadres(): void {
    this._service.getPadresLista().then(
      (resp: any[]) => {
        this.dependenciaOptions = resp;
      }
    );
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get dependenciaPadreId(): AbstractControl {
    return this.form.get('dependenciaPadreId');
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
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('codigo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.codigo.setErrors(errors);
          }

          if ('nombre' in resp.error.errors) {
            this.nombre.markAsDirty();
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('dependenciaPadreId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.dependenciaPadreId.forEach(element => {
              errors[element] = true;
            });
            this.dependenciaPadreId.setErrors(errors);

          }
        }
      });
  }
}
