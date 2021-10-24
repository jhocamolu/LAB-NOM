import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormularioParametroService } from './formulario.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'concepto-nominas-cuentas-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FormularioParametroComponent implements OnInit {

    form: FormGroup;

    centroCostos: any[] = [];
    filteredCuentaContables: Observable<string[]>;
    filteredCentroCostos: Observable<string[]>;

    submit: boolean;
    espera: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<FormularioParametroComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioParametroService,
    ) {

        console.log(this.data.naturaleza);

        this.form = this._formBuilder.group({
            id: [this.data.id, []],
            tipoLiquidacionId: [this.data.tipoLiquidacionId, [Validators.required]],
            tipoComprobante: [this.data.tipoComprobante, [Validators.required]],
            naturaleza: [this.data.naturaleza, [Validators.required]],
            centroCosto: [this.data.centroCosto, [Validators.required]],
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
    }

    guardarHandle(event): void {
        this.submit = true;
        this.espera = true;
        const formValue = this.form.value;

        if (formValue.centroCosto) {
            formValue.centroCostoId = formValue.centroCosto.id;
        }
        if (formValue.cuentaContable) {
            formValue.cuentaContableId = formValue.cuentaContable.id;
        }

        this._service.upsert(formValue).then((resp) => {
            this.submit = false;
            this.espera = false;
            this.dialogRef.close(true);
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {
            this.submit = false;
            this.espera = false;
            
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('tipoComprobante' in error.errors) {
                    const errores = {};
                    error.errors.tipoComprobante.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('tipoComprobante').setErrors(errores);
                }
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('naturaleza' in error.errors) {
                    const errores = {};
                    error.errors.naturaleza.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('naturaleza').setErrors(errores);
                }
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
            
            if ('tipoLiquidacionId' in error.errors) {
                let msg = '';
                error.errors.tipoLiquidacionId.forEach(element => {
                    msg = element;
                });
                this._alcanosSnackBar.snackbar({
                    clase: 'error',
                    mensaje: msg,
                    time: 5000
                });
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
