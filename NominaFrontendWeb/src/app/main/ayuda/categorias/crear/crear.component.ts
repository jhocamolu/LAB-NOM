import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'ayuda-categorias-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  categoriaOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService
  ) {

    this.form = this._formBuilder.group({
      orden: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(4)]],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(64)]],
      categoriaId: [null],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectPadres();
  }

  public selectPadres(): void {
    this._service.getCategoriasLista().then(
      (resp: any[]) => {
        this.categoriaOptions = resp;
      }
    );
  }

  get orden(): AbstractControl {
    return this.form.get('orden');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get categoriaId(): AbstractControl {
    return this.form.get('categoriaId');
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
        let mensajes = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensajes = 'Se ha presentado un error al procesar el formulario.';
        }
        this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: mensajes });
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400) {
          if ('orden' in error) {
            const errores = {};
            error.orden.forEach(element => {
              errores[element] = true;
            });
            this.orden.setErrors(errores);
          }

          if ('nombre' in error) {
            const errores = {};
            error.nombre.forEach(element => {
              errores[element] = true;
            });
            this.nombre.setErrors(errores);
          }

          if ('categoriaPadreId' in error) {
            const errores = {};
            error.categoriaPadreId.forEach(element => {
              errores[element] = true;
            });
            this.categoriaId.setErrors(errores);
          }
        }
      });
  }
}
