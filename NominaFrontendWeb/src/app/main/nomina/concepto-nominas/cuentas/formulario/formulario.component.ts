import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormularioService } from './formulario.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
    selector: 'concepto-nominas-cuentas-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CuentasFormularioComponent implements OnInit {

    form: FormGroup;

    centroCostos: any[] = [];
    filteredCuentaContables: Observable<string[]>;
    filteredCentroCostos: Observable<string[]>;

    submit: boolean;
    espera: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<CuentasFormularioComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioService,
    ) {
        this.form = this._formBuilder.group({
            id: [data.id],
            conceptoNominaId: [data.conceptoNominaId],
            centroCosto: [this.data.centroCosto, []],
            cuentaContable: [this.data.cuentaContable, [Validators.required]],
        });
        if (data.id) {
            this.form.markAllAsTouched();
        }
        this.submit = false;
    }

    ngOnInit(): void {

        this.filteredCuentaContables = this.form.get('cuentaContable')
            .valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getCuentaContablesFiltro(value))
            );

        this.filteredCentroCostos = this.form.get('centroCosto')
            .valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getCentroCostosFiltro(value))
            );

        this.form.get('cuentaContable').valueChanges.subscribe(value => {
            if (typeof value === 'object') {
                if (value.naturaleza == 'Debito') {
                    this.form.get('centroCosto').setErrors({ 'required': true });
                    this.form.get('centroCosto').setValidators([Validators.required]);
                }
                if (value.naturaleza == 'Credito') {
                    this.form.get('centroCosto').setErrors(null);
                    this.form.get('centroCosto').clearValidators();
                }
            }
        });

        this.form.get('centroCosto').valueChanges.subscribe(value => {
            if (typeof value === 'object') {
                const valo = this.form.get('cuentaContable').value;
                if (valo.naturaleza == 'Credito') {
                    this.form.get('centroCosto').setErrors({ 'No se debe ingresar una cuenta contable crédito con centro de costo.': true });
                }
            }
        });

    }

    guardarHandle(event): void {
        this.submit = true;

        this.espera = true;
        const formValue = this.form.value;
        if (formValue.centroCosto) {
            formValue.centroCostoId = formValue.centroCosto.id;
        }
        formValue.cuentaContableId = formValue.cuentaContable.id;

        this._service.upsert(formValue).then((resp) => {
            this.submit = false;
            this.espera = false;
            this.dialogRef.close(true);
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {
            this.espera = false;

            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('centroCostoId' in error.errors) {
                    const errores = {};
                    error.errors.centroCostoId.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('centroCosto').setErrors(errores);
                }
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('cuentaContableId' in error.errors) {
                    const errores = {};
                    error.errors.cuentaContableId.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('cuentaContable').setErrors(errores);
                }
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('conceptoNominaId' in error.errors) {
                    let errores: string = null;
                    error.errors.conceptoNominaId.forEach(element => {
                        errores = element;
                    });
                    this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: errores
                    });
                }
            }

            if ('snack' in error.errors) {
                let msg = '';
                error.errors.snack.forEach(element => {
                    msg = element;
                });
                this._alcanosSnackBar.snackbar({
                    clase: 'error',
                    mensaje: msg,
                    time: 5000
                });
            }

        });

    }

    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validate(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;
        if (value.centroCosto != null && typeof value.centroCosto !== 'object') {
            const errors = {};
            errors['Requerido'] = true;
            formGroup.get('centroCosto').setErrors(errors);
        }

        if (value.cuentaContable != null && typeof value.cuentaContable !== 'object') {
            const errors = {};
            errors['Requerido'] = true;
            formGroup.get('cuentaContable').setErrors(errors);
        }
        return null;
    }


    displayFn(element: any): string {
        return element ? `${element.cuenta} - ${element.nombre}` : element;
    }

    displayFnCentroCostos(element: any): string {
        return element ? `${element.codigo} - ${element.nombre}` : element;
    }

}
