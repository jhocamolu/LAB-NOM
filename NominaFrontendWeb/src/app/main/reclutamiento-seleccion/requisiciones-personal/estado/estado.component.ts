import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { EstadoService } from './estado.service';
import { estadoRequisicionPersonalAlcanos } from '@alcanos/constantes/estado-requisicion-personal';

@Component({
  selector: 'estado-requisicion-personal',
  templateUrl: './estado.component.html',
  styleUrls: ['./estado.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EstadoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  estadoRequisicion = estadoRequisicionPersonalAlcanos;
  titulo: string;
  mensaje: string;
  active: string;
  tooltip: string;

  constructor(
    public dialogRef: MatDialogRef<EstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EstadoService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, Validators.required],
      justificacion: [null, Validators.required],
    });
  }

  ngOnInit(): void {

    /*
    * @titulo 
    * @mensaje
    * @active activo, delete ,exito
    * @tooltip
    */
    switch (this.element.type) {
      case this.estadoRequisicion.anulada:
        this.titulo = 'Anular';
        this.mensaje = '¿Desea anular la requisición?';
        this.active = 'delete';
        this.tooltip = 'anula';
        break;
      case this.estadoRequisicion.aprobada:
        this.titulo = 'Aprobar';
        this.mensaje = '¿Desea aprobar la requisición?';
        this.active = 'activo';
        this.tooltip = 'aprueba';
        break;
      case this.estadoRequisicion.autorizada:
        this.titulo = 'Autorizar';
        this.mensaje = '¿Desea autorizar la requisición?';
        this.active = 'activo';
        this.tooltip = 'autoriza';
        break;
      case this.estadoRequisicion.cancelada:
        this.titulo = 'Cancelar';
        this.mensaje = '¿Desea cancelar la requisición?';
        this.active = 'delete';
        this.tooltip = 'cancela';
        break;
      case this.estadoRequisicion.revisada:
        this.titulo = 'Revisar';
        this.mensaje = '¿El resultado de la revisión ha sido?';
        this.active = 'exito';
        this.tooltip = 'revisa';
        break;
    }

    this.form.get('estado').valueChanges.subscribe(
      (value) => {
        if (this.element.type == this.estadoRequisicion.anulada || this.element.type == this.estadoRequisicion.cancelada) {
          if (!value) {
            this.form.get('justificacion').disable();
          } else {
            this.form.get('justificacion').enable();
          }
        }
      }
    );

  }


  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;

    if (this.estadoRequisicion.aprobada == this.element.type) {
      if (formValue.estado) {
        formValue.estado = this.estadoRequisicion.aprobada;
      } else {
        formValue.estado = this.estadoRequisicion.rechazada;
      }
    }

    if (this.estadoRequisicion.anulada == this.element.type) {
      if (formValue.estado) {
        formValue.estado = this.estadoRequisicion.anulada;
      }
    }

    if (this.estadoRequisicion.autorizada == this.element.type) {
      if (formValue.estado) {
        formValue.estado = this.estadoRequisicion.autorizada;
      } else {
        formValue.estado = this.estadoRequisicion.rechazada;
      }
    }

    if (this.estadoRequisicion.cancelada == this.element.type) {
      if (formValue.estado) {
        formValue.estado = this.estadoRequisicion.cancelada;
      } 
    }



    if (this.estadoRequisicion.revisada == this.element.type) {
      if (formValue.estado) {
        formValue.estado = this.estadoRequisicion.revisada;
      } else {
        formValue.estado = this.estadoRequisicion.rechazada;
      }
    }

    this._service.estado(this.element.id, formValue)
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
            resp.error.errors.estado.forEach(element => { errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }
          if ('justificacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.justificacion.forEach(element => { errors[element] = true;
            });
            this.form.get('justificacion').setErrors(errors);
          }
        }
      });
  }

}
