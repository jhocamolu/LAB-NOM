import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { ListarService } from '../listar/listar.service';
import { AprobarService } from './aprobar.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoSolicitudCesantiasAlcanos } from '@alcanos/constantes/estado-cesantias';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'solicitud-cesantias-aprobar',
  templateUrl: './aprobar.component.html',
  styleUrls: ['./aprobar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AprobarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  estadoSolicitud = estadoSolicitudCesantiasAlcanos;

  enviroments: string = environmentAlcanos.gestorArchivos;

  constructor(
    public dialogRef: MatDialogRef<AprobarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: ListarService,
    private _service2: AprobarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, Validators.required],
      observacion: [null, Validators.required],
    });
  }

  ngOnInit(): void {
  }


  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjunto}`, '_blank');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service2.estado(this.element.id, formValue)
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
          if ('estado' in resp.error.errors) {
            const errors = {};
            resp.error.errors.estado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }
          if ('observacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }
        }
      });
  }


}
