import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatColors } from '@fuse/mat-colors';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'formulario-crear',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit {

  action: string;
  event;
  eventForm: FormGroup;
  dialogTitle: string;

  submit: boolean;

  /**
   * 
   * @param matDialogRef 
   * @param _data 
   * @param _service 
   * @param _matSnackBar 
   * @param _formBuilder 
   */
  constructor(
    public matDialogRef: MatDialogRef<FormularioComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _service: FormularioService,
    private _matSnackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) {
    this.event = _data.event;
    this.action = _data.action;
    this.submit = false;

    if (this.action === 'edit') {
      this.dialogTitle = 'Editar festivo';
    }
    else {
      this.dialogTitle = 'Añadir festivo';

      this.event = {
        start: _data.date,
      };

    }

    this.eventForm = this.createEventForm();
  }

  ngOnInit(): void {

  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  /**
   * 
   *
   * @returns {FormGroup}
   */
  createEventForm(): FormGroup {
    return new FormGroup({
      title: new FormControl(this.event.title, Validators.required),
      start: new FormControl(this.event.start, Validators.required),

    });
  }


  guardarHandle(event): void {
    const formValue = this.eventForm.value;
    const element = {
      fecha: formValue.start,
      nombre: formValue.title,
    };
    if ('id' in this.event) {
      element['id'] = this.event.id;
    }
    this.submit = true;
    this._service.upsert(element)
      .then(
        (resp) => {
          this.matDialogRef.close(resp);
          this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['exito-snackbar'],
          });

        }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('fecha' in resp.error.errors) {
            const errors = {};
            resp.error.errors.fecha.forEach(element => {
              errors[element] = true;
            });
            this.eventForm.get('start').setErrors(errors);
          }

          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.eventForm.get('title').setErrors(errors);
          }
        }
      });
  }

}
