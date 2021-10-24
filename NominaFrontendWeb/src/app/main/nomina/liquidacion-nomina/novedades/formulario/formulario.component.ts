import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FormularioService } from './formulario.service';

@Component({
  selector: 'novedades-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit {

  item: any;
  form: FormGroup;
  isDisabled = false;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<FormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: FormularioService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      cantidad: [element.cantidad, [Validators.required, Validators.min(0), Validators.max(100000)]],
      valor: [element.valor, [Validators.required, Validators.min(1), Validators.max(100000000)]],
      observacion: [element.observacion, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    if (this.element.conceptoNomina.requiereCantidad === true) {
      this.form.get('valor').disable();
    }
    if (this.element.conceptoNomina.requiereCantidad === false) {
      this.form.get('cantidad').disable();
    }
  }

  get cantidad(): AbstractControl {
    return this.form.get('cantidad');
  }
  get valor(): AbstractControl {
    return this.form.get('valor');
  }
  get observacion(): AbstractControl {
    return this.form.get('observacion');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
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
          if ('cantidad' in error.errors) {
            const errors = {};
            error.errors.cantidad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cantidad').setErrors(errors);
          }
          if ('valor' in error.errors) {
            const errors = {};
            error.errors.valor.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valor').setErrors(errors);
          }
          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }
        }
      });

  }

}
