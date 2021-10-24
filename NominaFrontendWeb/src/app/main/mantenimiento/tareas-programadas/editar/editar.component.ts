import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'tareas-programadas-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;


  constructor(
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: EditarService,

  ) {
    this.form = this._formBuilder.group({
      id: [null, []],
      alias: [null, []],
      enEjecucion: [null, [Validators.required]],
    });
    this.submit = false;
    this.id = this._service.id;
  }

  ngOnInit(): void {
    this._service.onTareaProgramadasChanged.subscribe(data => {
      this.item = data;
      this.form.patchValue({
        id: data.id,
        enEjecucion: data.enEjecucion,
        alias: data.alias
      });
    });
  }

  ngAfterViewInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    // se inyecta en el promise editar el id y el formValue
    this._service.editar(formValue)
      .then((resp) => {
        this._service.getTareaProgramadas();
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
        this._router.navigate([`/mantenimiento/tareas-programadas`]);
        this.submit = false;
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
          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }

          if ('Descripcion' in error.errors) {
            const errors = {};
            error.errors.Descripcion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('Descripcion').setErrors(errors);
          }
          if ('instruccion' in error.errors) {
            const errors = {};
            error.errors.instruccion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('instruccion').setErrors(errors);
          }
          if ('Periodicidad' in error.errors) {
            const errors = {};
            error.errors.Periodicidad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('Periodicidad').setErrors(errors);
          }
          if ('enEjecucion' in error.errors) {
            const errors = {};
            error.errors.enEjecucion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('enEjecucion').setErrors(errors);
          }

          if ('alias' in error.errors) {
            const errors = {};
            error.errors.alias.forEach(element => {
              errors[element] = true;
            });
            this.form.get('alias').setErrors(errors);
          }
         
        }
      });
  }

}
