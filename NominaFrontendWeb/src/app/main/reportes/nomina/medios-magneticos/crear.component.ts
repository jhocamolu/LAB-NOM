import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CrearService } from './crear.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { RouterLink, Router } from '@angular/router';
import * as moment from 'moment';


@Component({
  selector: 'medios-magneticos-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediosMagneticosComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  annoOptions: any[];
  espera: boolean = false;
  annioActual: any;

  constructor(
    public dialogRef: MatDialogRef<MediosMagneticosComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService,
    private _router: Router
  ) {
    this.annioActual = moment().year();
    this.form = this._formBuilder.group({
      annio: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.getAnnoLista().then(resp => {
      const datos = [];
      resp.map(element => {
        if (element.anno == this.annioActual - 1) {
          this.form.patchValue({
            annio: element.id,
          });
        }
        datos.push(element);
      });
      this.annoOptions = datos;
    });
  }



  guardarHandle(event): void {
    const formValue = this.form.value;
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
          if ('annio' in error.errors) {
            const errors = {};
            error.errors.annio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('annio').setErrors(errors);
          }

        }
      });

  }

}
