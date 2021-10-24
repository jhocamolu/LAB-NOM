import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';

import { AlcanosValidators } from '@alcanos/utils';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { isArray } from 'util';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { claseSustitutos } from '@alcanos/constantes/clase-sustitutos';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';

@Component({
    selector: 'sustitutos-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    submit: boolean;
    item: any;

    cargoOptions: any;
    getCentroOperativoOptions: any;

    filteredCargoASustituir: Observable<string[]>;
    filteredCargoSustituto: Observable<string[]>;
    claseSustituto = claseSustitutos;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: FormularioService,
        private _matDialog: MatDialog,
    ) {

        this.form = this._formBuilder.group({
            id: [null],
            cargoASustituir: [null, [Validators.required]],
            centroOperativoASutituirId: [null, []],
            cargoSustituto: [null, [Validators.required]],
            centroOperativoSustitutoId: [null, []],
            fechaInicio: [null, [Validators.required]],
            fechaFinal: [null, [Validators.required]],
            observacion: [null, []],
        }, { validators: this.validate });

        this._service.getCentroOperativo().then(resp => {
            this.getCentroOperativoOptions = resp;
        });

    }

    ngOnInit(): void {
        this._service.onItemChanged.subscribe(resp => {
            if (resp == null) {
                this.item = null;
            }
            if (resp != null) {
                this.item = resp;

                this.form.patchValue({
                    id: this.item.id,
                    cargoSustituto: this.item.cargoSustituto,
                    centroOperativoSustitutoId: this.item.centroOperativoSustitutoId,
                    cargoASustituir: this.item.cargoASustituir,
                    centroOperativoASutituirId: this.item.centroOperativoASutituirId,
                    fechaInicio: this.item.fechaInicio,
                    fechaFinal: this.item.fechaFinal,
                    observacion: this.item.observacion,
                });
                this.centroOperativoSustituto(this.item.cargoSustituto.clase);
                this.centroOperativoASustituir(this.item.cargoSustituto.clase);


                this.form.markAllAsTouched();
            }

            /* this.form.get('fechaInicio').valueChanges.subscribe(
                 (value) => {
                     let fechaInicio = value;
                     fechaInicio = moment(fechaInicio).toDate();
                     const fechaInicioSistema = moment(this.item.fechaInicio).toDate();
                     //
                     if (fechaInicio.getTime() < fechaInicioSistema.getTime()) {
                         console.log(fechaInicio.getTime() < fechaInicioSistema.getTime());
                         const errors = {};
                         errors['La fecha de inicio no puede ser menor a la fecha que ingresaste cuando registraste el reemplazo.'] = true;
                         this.form.get('fechaInicio').setErrors(errors);
                     }
                 }
             );*/

            this.filteredCargoASustituir = this.form.get('cargoASustituir')
                .valueChanges
                .pipe(
                    debounceTime(300),
                    switchMap(value => this._service.getCargos(value))
                );


            this.filteredCargoSustituto = this.form.get('cargoSustituto')
                .valueChanges
                .pipe(
                    debounceTime(300),
                    switchMap(value => this._service.getCargos(value))
                );

        });

        this.form.get('cargoASustituir').valueChanges.subscribe(
            (value) => {
                this.centroOperativoASustituir(value.clase);
            }
        );

        this.form.get('cargoSustituto').valueChanges.subscribe(
            (value) => {
                this.centroOperativoSustituto(value.clase);
            }
        );

    }

    centroOperativoASustituir(clase: string): void {
        switch (clase) {
            case claseSustitutos.centroOperativo:
                const errors = {};
                errors['Requerido'] = true;
                this.form.get('centroOperativoASutituirId').setErrors(errors);
                break;
            case claseSustitutos.nacional:
                this.form.get('centroOperativoASutituirId').disable();
                break;
            default:
                this.form.get('centroOperativoASutituirId').clearValidators();
                this.form.get('centroOperativoASutituirId').setErrors(null);
                this.form.get('centroOperativoASutituirId').enable();
                break;
        }
    }

    centroOperativoSustituto(clase: string): void {
        switch (clase) {
            case claseSustitutos.centroOperativo:
                const errors = {};
                errors['Requerido'] = true;
                this.form.get('centroOperativoSustitutoId').setErrors(errors);
                break;
            case claseSustitutos.nacional:
                this.form.get('centroOperativoSustitutoId').disable();
                break;
            default:
                this.form.get('centroOperativoSustitutoId').clearValidators();
                this.form.get('centroOperativoSustitutoId').setErrors(null);
                this.form.get('centroOperativoSustitutoId').enable();
                break;
        }

    }



    ngAfterViewInit(): void { }

    strToDateFormat(str: string): string {
        moment.locale('es');
        return moment(str).format('MMM DD, Y  ');
    }

    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validate(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;
        if (value.id == null && value.fechaInicio != null) {
            formGroup.get('fechaInicio').setErrors(null);
            let fechaInicio = value.fechaInicio;
            if (typeof fechaInicio === 'string') {
                fechaInicio = moment(fechaInicio).toDate();
            } else {
                fechaInicio = value.fechaInicio.toDate();
            }

            // reduce un día la fecha actual .subtract(1, 'day').toDate();
            //
            if (fechaInicio.getTime() < moment().subtract(1, 'day').toDate().getTime()) {
                const errors = {};
                errors['La fecha inicial no puede ser menor que la fecha actual.'] = true;
                formGroup.get('fechaInicio').setErrors(errors);
            }
        }

        if (value.fechaInicio != null && value.fechaFinal != null) {
            formGroup.get('fechaFinal').setErrors(null);

            let fechaInicio = value.fechaInicio;
            let fechaFinal = value.fechaFinal;

            if (typeof fechaInicio === 'string') {
                fechaInicio = moment(fechaInicio).toDate();
            } else {
                fechaInicio = value.fechaInicio.toDate();
            }

            if (typeof fechaFinal === 'string') {
                fechaFinal = moment(fechaFinal).toDate();
            } else {
                fechaFinal = value.fechaFinal.toDate();
            }

            if (fechaFinal.getTime() <= fechaInicio.getTime()) {
                const errors = {};
                errors['La fecha final no puede ser menor o igual a la fecha inicial.'] = true;
                formGroup.get('fechaFinal').setErrors(errors);
            }
        }

        return null;
    }


    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;

        if (formValue.fechaInicio) {
            formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DD');
        }

        if (formValue.fechaFinal) {
            formValue.fechaFinal = moment(formValue.fechaFinal).format('YYYY-MM-DD');
        }

        // Codigo de mantenimiento para validaciones
        /* Object.keys(this.form.controls).forEach(key => {
             console.log(`${key} es valido : ${this.form.get(key).valid}`);
             console.log(this.form.get(key).errors);
         }); */


        if (this.item != null) {
            formValue.id = this.item.id;
        }

        if (formValue.cargoASustituir) {
            formValue.cargoASustituirId = formValue.cargoASustituir.id;
        }

        if (formValue.cargoSustituto) {
            formValue.cargoSustitutoId = formValue.cargoSustituto.id;
        }

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._router.navigate([`/flujo-trabajos/sustitutos/`]);
                this.submit = false;
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
                    if ('snackbarError' in error.errors) {
                        const errors = {};
                        error.errors.snackbarError.forEach(element => {
                            this._alcanosSnackBar.snackbar({
                                clase: 'error',
                                mensaje: element,
                                time: 6000
                            });
                        });
                    }

                    if ('snackbarAdvertencia' in error.errors) {
                        const errors = {};
                        error.errors.snackbarAdvertencia.forEach(element => {
                            this._alcanosSnackBar.snackbar({
                                clase: 'advertencia',
                                mensaje: element,
                                time: 6000
                            });
                        });
                    }

                    if ('informativo' in error.errors) {
                        const errors = {};
                        error.errors.informativo.forEach(element => {
                            this._matDialog.open(AlcanosDialogComponent, {
                                disableClose: false,
                                data: {
                                    mensaje: element,
                                    clase: 'informativo',
                                }
                            });
                        });
                    }

                    if ('cargoASustituirId' in error.errors) {
                        const errors = {};
                        error.errors.cargoASustituirId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('cargoASustituir').setErrors(errors);
                    }


                    if ('centroOperativoASutituirId' in error.errors) {
                        const errors = {};
                        error.errors.centroOperativoASutituirId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('centroOperativoASutituirId').setErrors(errors);
                    }

                    if ('cargoSustitutoId' in error.errors) {
                        const errors = {};
                        error.errors.cargoSustitutoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('cargoSustituto').setErrors(errors);
                    }

                    if ('centroOperativoSustitutoId' in error.errors) {
                        const errors = {};
                        error.errors.centroOperativoSustitutoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('centroOperativoSustitutoId').setErrors(errors);
                    }

                    if ('fechaInicio' in error.errors) {
                        const errors = {};
                        error.errors.fechaInicio.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaInicio').setErrors(errors);
                    }

                    if ('fechaFinal' in error.errors) {
                        const errors = {};
                        error.errors.fechaFinal.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaFinal').setErrors(errors);
                    }

                    if ('observacion' in error.errors) {
                        const errors = {};
                        error.errors.observacion.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('observacion').setErrors(errors);
                    }

                }
            });
    }


    displayFnCargoASustituir(element: any): string {
        return element ? element.nombre : element;
    }

    displayFnCargoSustituto(element: any): string {
        return element ? element.nombre : element;
    }


}
