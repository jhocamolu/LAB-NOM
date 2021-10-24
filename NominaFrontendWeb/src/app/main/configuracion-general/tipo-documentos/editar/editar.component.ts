import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ElementRef, ViewChild, ContentChildren, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgModel, FormControlDirective } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatInput } from '@angular/material';
import { EditarService } from './editar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
  selector: 'tipo-documentos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditarComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;


  constructor(
    public dialogRef: MatDialogRef<EditarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      codigoPila: {value: element.codigoPila, disabled: true},
      codigoDian: {value: element.codigoDian, disabled: true},
      nombre: [element.nombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(150), Validators.required]],
      equivalenteBancario: [element.equivalenteBancario, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(2)]],
      formato: [element.formato, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    
  }

  get codigoPila(): AbstractControl {
    return this.form.get('codigoPila');
  }

  get codigoDian(): AbstractControl {
    return this.form.get('codigoDian');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  get equivalenteBancario(): AbstractControl {
    return this.form.get('equivalenteBancario');
  }

  get formato(): AbstractControl {
    return this.form.get('formato');
  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.codigoPila = this.element.codigoPila;
    formValue.codigoDian = this.element.codigoDian;
    this._service.editar(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(resp);
        this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['exito-snackbar'],
        });
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
          if ('codigoPila' in error.errors) {
            const errors = {};
            error.errors.codigoPila.forEach(element => {
              errors[element] = true;
            });
            this.codigoPila.setErrors(errors);
          }

          if ('codigoDian' in error.errors) {
            const errors = {};
            error.errors.codigoDian.forEach(element => {
              errors[element] = true;
            });
            this.codigoDian.setErrors(errors);
          }

          if ('nombre' in error.errors) {
            this.nombre.markAsDirty();
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }

          if ('formato' in error.errors) {
            const errors = {};
            error.errors.formato.forEach(element => {
              errors[element] = true;
            });
            this.formato.setErrors(errors);

          }
        }
      });
  }
}
