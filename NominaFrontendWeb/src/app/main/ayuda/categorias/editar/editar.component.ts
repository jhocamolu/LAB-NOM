import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ElementRef, ViewChild, ContentChildren, QueryList, ViewChildren, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgModel, FormControlDirective } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
  selector: 'ayuda-categorias-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  categoriaOptions: any[] = [];


  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {

    this.form = this._formBuilder.group({
      id: [element.id],
      orden: [element.orden, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(4), Validators.required]],
      nombre: [element.nombre, [Validators.required, AlcanosValidators.maxLength(64)]],
      categoriaId: [element.categoriaId],
    });
    this.form.markAllAsTouched();
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectPadres();
  }

  public selectPadres(): void {
    this._service.getCategoriasLista(this.element.id).then(
      (resp: any[]) => {
        this.categoriaOptions = resp;
      }
    );
  }

  ngAfterViewInit(): void {

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

    this._service.editar(this.element.id, formValue)
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
