import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CrearConceptoService } from './crear-concepto.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'tipo-ausentismos-crear-concepto',
  templateUrl: './crear-concepto.component.html',
  styleUrls: ['./crear-concepto.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearConceptoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  accion: any;

  conceptoNominaOptions: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CrearConceptoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: CrearConceptoService
  ) {
    this.accion = element.accion;
    this.submit = false;


    this.form = this._formBuilder.group({
      id: [null],
      tipoAusentismoId: [null],
      conceptoNominaId: [null, [Validators.required]],
      coberturaDesde: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(9999)]],
      coberturaHasta: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(9999)]],
    }, { validators: this.validate });

  }

  ngOnInit(): void {

    this.selectConceptoNomina();
    if (this.accion === 'crear') {
      this.form.patchValue({
        tipoAusentismoId: this.element.element,

      });
    }
    if (this.accion === 'editar') {
      this.form.patchValue({

        id: this.element.element.id,
        tipoAusentismoId: this.element.element.tipoAusentismoId,
        conceptoNominaId: this.element.element.conceptoNominaId,
        coberturaDesde: this.element.element.coberturaDesde,
        coberturaHasta: this.element.element.coberturaHasta,

      });
      this.form.markAllAsTouched();
    }

    this.form.get('coberturaDesde').setErrors(null);
    this.form.get('coberturaHasta').setErrors(null);
  }


  public selectConceptoNomina(): void {
    this._service.getConceptoNominaLista().then(
      (resp: any[]) => {
        this.conceptoNominaOptions = resp;
      }
    );
  }
  get conceptoNominaId(): AbstractControl {
    return this.form.get('conceptoNominaId');
  }

  get coberturaDesde(): AbstractControl {
    return this.form.get('coberturaDesde');
  }

  get coberturaHasta(): AbstractControl {
    return this.form.get('coberturaHasta');
  }



  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;
    const mensaje = 'La cobertura desde no puede ser mayor que la cobertura hasta.';
    if (value.coberturaDesde != null && value.coberturaHasta != null) {
      const errors = Object.assign({}, formGroup.get('coberturaHasta').errors);
      const coberturaDesde = parseInt(value.coberturaDesde);
      const coberturaHasta = parseInt(value.coberturaHasta);
      if (coberturaHasta < coberturaDesde) {
        errors[mensaje] = true;
      } else {
        delete errors[mensaje];
      }

      if (Object.keys(errors).length > 0) {
        formGroup.get('coberturaHasta').setErrors(errors);
      } else {
        formGroup.get('coberturaHasta').setErrors(null);
      }


    }



    return null;
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.upsert(formValue, this.accion)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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
          if ('conceptoNominaId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaId.forEach(element => {
              errors[element] = true;
            });
            this.conceptoNominaId.setErrors(errors);
          }
          if ('coberturaDesde' in error.errors) {
            const errors = {};
            error.errors.coberturaDesde.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.coberturaDesde.setErrors(errors);
          }
          if ('coberturaHasta' in error.errors) {
            const errors = {};
            error.errors.coberturaHasta.forEach(element => {
              mensaje = element;
              errors['Error'] = true;
            });
            this.form.get('coberturaHasta').setErrors(errors);
          }
        }
        // this._matSnackBar.open(mensaje, 'Aceptar', {
        //   verticalPosition: 'top',
        //   duration: 9000,
        //   panelClass: ['error-snackbar'],
        // });
      });
  }

}
