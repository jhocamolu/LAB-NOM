import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ElementRef, ViewChild, ContentChildren, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgModel, FormControlDirective } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'dependencias-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  dependenciaOptions: any[] = [];


  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EditarService,
  ) {

    this.form = this._formBuilder.group({
      id: [element.dependenciaHijoId],
      codigo: [element.dependenciaHijo.codigo, [AlcanosValidators.alfanumerico, AlcanosValidators.minLength(1), AlcanosValidators.maxLength(10), Validators.required]],
      nombre: [element.dependenciaHijo.nombre, [AlcanosValidators.alfabetico, Validators.required, AlcanosValidators.maxLength(255)]],
      dependenciaPadreId: [element.dependenciaPadreId],
      dependenciaJerarquiaId: [element.id],
    });
    this.form.markAllAsTouched();
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectPadres();
  }

  public selectPadres(): void {
    this._service.getPadresLista().then(
      (resp: any[]) => {
        this.dependenciaOptions = resp;
      }
    );
  }

  ngAfterViewInit(): void {

  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get dependenciaPadreId(): AbstractControl {
    return this.form.get('dependenciaPadreId');
  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    this._service.editar(this.element.dependenciaHijoId, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
      ).catch((resp: HttpErrorResponse) => {

        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('codigo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.codigo.setErrors(errors);
          }

          if ('nombre' in resp.error.errors) {
            this.nombre.markAsDirty();
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('dependenciaPadreId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.dependenciaPadreId.forEach(element => {
              errors[element] = true;
            });
            this.dependenciaPadreId.setErrors(errors);

          }
        }
      });
  }
}
