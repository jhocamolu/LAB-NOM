import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CrearService } from './crear.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { RouterLink, Router } from '@angular/router';
import { reporteEstadoRegistraduria } from '@alcanos/constantes/reportes-estados';
@Component({
  selector: 'registraduria-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegistraduriaComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  registraduriaConstant = reporteEstadoRegistraduria;
  espera: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RegistraduriaComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService,
    private _router: Router
  ) {

    this.form = this._formBuilder.group({
      estadoFuncionario: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void { }



  guardarHandle(event): void {
    const formValue = this.form.value;

    if (typeof formValue.estadoFuncionario != 'string') {
      formValue.estadoFuncionario = formValue.estadoFuncionario.join(',');
    }
    this.espera = true;
    this.submit = true;
    this._service.crear(formValue)
      .then((resp) => {
        this.espera = false;
        this.submit = false;
        window.open(resp.url + resp.file, "_blank");
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        //this.dialogRef.close(true);
      }
      ).catch((resp: HttpErrorResponse) => {

        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('estadoFuncionario' in error.errors) {
            const errors = {};
            error.errors.estadoFuncionario.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estadoFuncionario').setErrors(errors);
          }

        }
      });

  }

}
