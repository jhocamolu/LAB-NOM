import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { EditarRetefuenteService } from './editar-retefuente.service';

@Component({
  selector: 'funcionario-editar-retefuente',
  templateUrl: './editar-retefuente.component.html',
  styleUrls: ['./editar-retefuente.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarRetefuenteComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  annoOptions: any[];

  constructor(
    public dialogRef: MatDialogRef<EditarRetefuenteComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarRetefuenteService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      funcionarioId: [element.funcionarioId],
      annoVigenciaId: [element.annoVigenciaId, [Validators.required]],
      interesVivienda: [element.interesVivienda, [Validators.required, Validators.max(100000000)]],
      medicinaPrepagada: [element.medicinaPrepagada, [Validators.required, Validators.max(100000000)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.getAnnoLista().then(resp => {
      this.annoOptions = resp;
    });

    // Desabilitar campos en el editar
    this.form.get('annoVigenciaId').disable();
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {

    this.submit = true;
    const formValue = this.form.value;
    this._service.editar(this.element.id, formValue)
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
