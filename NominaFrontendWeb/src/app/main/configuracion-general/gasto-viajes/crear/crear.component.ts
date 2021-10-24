import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearService } from './crear.service';
import { tipoGastoViaje } from '@alcanos/constantes/gasto-viajes';

@Component({
  selector: 'gasto-viajes-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  id: number;
  tipoGastoViaje = tipoGastoViaje;
  conceptoNominaOptions: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<CrearComponent>,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearService
  ) {
    this.form = this._formBuilder.group({
      tipo: [null, [Validators.required]],
      conceptoNominaId: [null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {

    this.conceptoNominaOptions = this.form.get('conceptoNominaId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );
  }

  get tipo(): AbstractControl {
    return this.form.get('tipo');
  }

  get conceptoNominaId(): AbstractControl {
    return this.form.get('conceptoNominaId');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  displayFnConceptos(element: any): string {
    return element ? `${element.codigo} - ${element.nombre}` : element;
  }

  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.conceptoNominaId != null && typeof value.conceptoNominaId !== 'object') {
      const errors = {};
      errors['Por favor, seleccione un concepto de nómina.'] = true;
      formGroup.get('conceptoNominaId').setErrors(errors);
    }

    return null;
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.conceptoNominaId = formValue.conceptoNominaId.id;    
    this._service.crear(formValue)
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
          if ('tipo' in error.errors) {
            const errors = {};
            error.errors.tipo.forEach(element => {
              errors[element] = true;
            });
            this.tipo.setErrors(errors);
          }
          if ('conceptoNominaId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaId.forEach(element => {
              errors[element] = true;
            });
            this.conceptoNominaId.setErrors(errors);
          }

        }
      });
  }

}
