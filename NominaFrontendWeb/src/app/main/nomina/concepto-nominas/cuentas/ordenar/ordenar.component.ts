import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenarService } from './ordenar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { OrdenarConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
@Component({
  selector: 'ordenar-concepto',
  templateUrl: './ordenar.component.html',
  styleUrls: ['./ordenar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdenarComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  espera: boolean = false;
  conceptoNominaOptions: Observable<string[]>;
  OrdenarConcepto = OrdenarConceptoAlcanos;

  constructor(
    public dialogRef: MatDialogRef<OrdenarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: OrdenarService
  ) {
    this.form = this._formBuilder.group({
      id: [element.cuentaContableId],
      condicion: [null, [Validators.required]],
      conceptoNomina: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {

    this.conceptoNominaOptions = this.form.get('conceptoNomina')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );
  }

  guardarHandle(event): void {
    this.submit = true;
    this.espera = true;
    const formValue = this.form.value;

    if (formValue.conceptoNomina != null) {
      formValue.conceptoNominaId = formValue.conceptoNomina.id;
      delete formValue.conceptoNomina;
    }

    this._service.ordenar(formValue.id, formValue)
      .then((resp) => {
        this.espera = false;
        this.submit = false;
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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
        if (resp.status === 400 && 'errors' in error) {
          if ('condicion' in error.errors) {
            const errors = {};
            error.errors.condicion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('condicion').setErrors(errors);
          }

          if ('conceptoNomina' in error.errors) {
            const errors = {};
            error.errors.conceptoNomina.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNomina').setErrors(errors);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000
            });
          }
        }
      });

  }

  displayFnConceptos(element: any): string {
    return element ? `${element.orden} -${element.codigo} - ${element.nombre}` : element;
  }

}
