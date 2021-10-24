import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ObtenerActividadService } from './aprobar.service';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';
import * as moment from 'moment';

@Component({
  selector: 'costos-aprobar',
  templateUrl: './aprobar.component.html',
  styleUrls: ['./aprobar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ObtenerActividadComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  estadoSolicitud = estadoBeneficiosAlcanos;
  espera: boolean;

  constructor(
    public dialogRef: MatDialogRef<ObtenerActividadComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: ObtenerActividadService,
  ) {
    this.espera = false;
    this.form = this._formBuilder.group({
      fechaFin: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
  }

  get fechaFin(): AbstractControl {
    return this.form.get('fechaFin');
  }


  guardarHandle(event): void {
    this.submit = true;
    this.espera = true;
    const formValue = this.form.value;

    formValue.fechaFin = moment(formValue.fechaFin).format('YYYY-MM-DD');

    this._service.actividadFuncionarios(formValue)
      .then((resp) => {
        this.espera = false;
        this.dialogRef.close(true);
        if(resp.status == 204){
          this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No se encontraron actividades para los funcionarios a la fecha de corte definida' });
        }else {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.espera = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (error.status === 400 && 'errors' in error) {
          if ('fechaFin' in error.errors) {
            const errors = {};
            error.errors.fechaFin.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFin').setErrors(errors);
          }

        }

        if (resp.status === 400 && 'errors' in error) {
          if ('dialogoConfirmacion' in error.errors) {
            let msg = '';
            error.errors.dialogoConfirmacion.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000
            });
          }
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('dialogoError ' in error.errors) {
            let msg = '';
            error.errors.dialogoError.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000
            });
          }
        }

        if (resp.status === 204) {
          this._alcanosSnackBar.snackbar({
            clase: 'error',
            mensaje: 'No se encontraron actividades para los funcionarios a la fecha de corte definida',
            time: 6000
          });
        }
      });
  }

}
