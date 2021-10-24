import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { CrearBitacoraService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';

import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';
import { reporteEstadoBitacora } from '@alcanos/constantes/reportes-estados';
import * as moment from 'moment';

@Component({
    selector: 'bitacora-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CrearBitacoraComponent implements OnInit {
    form: FormGroup;
    submit: boolean;
    tipoLiquidacionOptions: any[];
    subperiodoOptions: any[];
    espera: boolean = false;
    estado: any;

    mesesData = [
        {
            id: 1,
            mes: 'Enero',
            activo: true
        },
        {
            id: 2,
            mes: 'Febrero',
            activo: true
        },
        {
            id: 3,
            mes: 'Marzo',
            activo: true
        },
        {
            id: 4,
            mes: 'Abril',
            activo: true
        },
        {
            id: 5,
            mes: 'Mayo',
            activo: true
        },
        {
            id: 6,
            mes: 'Junio',
            activo: true
        },
        {
            id: 7,
            mes: 'Julio',
            activo: true
        },

        {
            id: 8,
            mes: 'Agosto',
            activo: true
        },
        {
            id: 9,
            mes: 'Septiembre',
            activo: true
        },
        {
            id: 10,
            mes: 'Octubre',
            activo: true
        },
        {
            id: 11,
            mes: 'Noviembre',
            activo: true
        },
        {
            id: 12,
            mes: 'Diciembre',
            activo: true
        }
    ];

    bitacoraConstant = reporteEstadoBitacora;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: CrearBitacoraService
    ) {
        this.tipoLiquidacionOptions = [];
        this.subperiodoOptions = [];
        this.estado = null;

        this.form = this._formBuilder.group({
            metodo: [null, [Validators.required]],
            tipoLiquidacionId: [null, [Validators.required]],
            subperiodoId: [null, []],
            nominaAnio: [null, []],
            nominaMes: [null, []],
            fechaInicial: [null, []],
            fechaFinal: [null, []],
        }, { validators: this.validate });
        this.submit = false;
    }

    ngOnInit(): void {

        this._selectTipoLiquidacion();
        this.form.get('tipoLiquidacionId').valueChanges.subscribe(value => {
            const tipoLiquidacion = this._getItem(this.tipoLiquidacionOptions, value);
            this.form.get('subperiodoId').setValue(null);
            if (tipoLiquidacion && tipoLiquidacion.tipoPeriodoId) {
                this._selectSubperiodos(tipoLiquidacion.tipoPeriodoId);
            }
        });

        this.form.get('metodo').valueChanges.subscribe(value => {

            switch (value) {
                case this.bitacoraConstant.periodo:
                    this.selectPeriodo();
                    this.estado = 'periodo';
                    break;
                case this.bitacoraConstant.acumulado:
                    this.selectAcumulado();
                    this.estado = 'acumulado';
                    break;
                default:
                    this.selectNulo();
                    this.estado = null;
                    break;
            }
            // Evaluador de cambios internos por interacción realizada // Oculta el error onepush 
            // https://medium.com/better-programming/expressionchangedafterithasbeencheckederror-in-angular-what-why-and-how-to-fix-it-c6bdc0b22787
            // console.log(ChangeDetectorRef, ChangeDetectionStrategy);
            // this.form.markAllAsTouched();
        });
    }

    selectAcumulado(): void {
        this.form.get('subperiodoId').setValue(null);
        this.form.get('nominaMes').setValue(null);
        this.form.get('nominaAnio').setValue(null);
        this.form.get('tipoLiquidacionId').setValue(null);

        this.form.get('subperiodoId').clearValidators();
        this.form.get('subperiodoId').setErrors(null);

        this.form.get('nominaMes').clearValidators();
        this.form.get('nominaMes').setErrors(null);

        this.form.get('nominaAnio').clearValidators();
        this.form.get('nominaAnio').setErrors(null);

        this.form.get('fechaInicial').setValidators([Validators.required]);
        this.form.get('fechaFinal').setValidators([Validators.required]);

    }

    selectPeriodo(): void {
        this.form.get('fechaInicial').setValue(null);
        this.form.get('fechaFinal').setValue(null);
        this.form.get('tipoLiquidacionId').setValue(null);

        this.form.get('fechaInicial').clearValidators();
        this.form.get('fechaInicial').setErrors(null);

        this.form.get('fechaFinal').clearValidators();
        this.form.get('fechaFinal').setErrors(null);

        this.form.get('subperiodoId').setValidators([Validators.required]);
        this.form.get('nominaAnio').setValidators([Validators.required, AlcanosValidators.numerico, Validators.min(2011), Validators.max(3000)]);
        this.form.get('nominaMes').setValidators([Validators.required]);
    }

    selectNulo(): void {
        this.submit = false;

        this.form.get('fechaInicial').setValue(null);
        this.form.get('fechaFinal').setValue(null);
        this.form.get('subperiodoId').setValue(null);
        this.form.get('nominaAnio').setValue(null);
        this.form.get('nominaMes').setValue(null);

        this.form.get('fechaInicial').clearValidators();
        this.form.get('fechaFinal').clearValidators();
        this.form.get('subperiodoId').clearValidators();
        this.form.get('nominaAnio').clearValidators();
        this.form.get('nominaMes').clearValidators();

        this.form.get('fechaInicial').setErrors(null);
        this.form.get('fechaFinal').setErrors(null);
        this.form.get('subperiodoId').setErrors(null);
        this.form.get('nominaAnio').setErrors(null);
        this.form.get('nominaMes').setErrors(null);

        this.estado = null;
    }


    private _selectTipoLiquidacion(): void {
        this._service.getTipoLiquidaciones().then(
            (resp: any[]) => {
                this.tipoLiquidacionOptions = resp;
            }
        );
    }

    private _selectSubperiodos(tipoPeriodoId: number): void {
        this.subperiodoOptions = [];
        this._service.getSubperiodos(tipoPeriodoId).then(
            (resp: any[]) => {
                this.subperiodoOptions = resp;
            }
        );
    }

    private _getItem(array: any[], id: number): any {
        let item = null;
        array.forEach(element => {
            if (element.id == id) {
                item = element;
                return;
            }
        });
        return item;
    }

    private get _subperiodoSeleted(): any | null {
        let subperiodo = null;
        this.subperiodoOptions.forEach(element => {
            if (this.form.get('subperiodoId').value && element.id == this.form.get('subperiodoId').value) {
                subperiodo = element;
            }
        });
        return subperiodo;
    }



    get metodo(): AbstractControl {
        return this.form.get('metodo');
    }

    get tipoLiquidacionId(): AbstractControl {
        return this.form.get('tipoLiquidacionId');
    }

    get subPeriodoId(): AbstractControl {
        return this.form.get('subPeriodoId');
    }

    get nominaAnio(): AbstractControl {
        return this.form.get('nominaAnio');
    }

    get nominaMes(): AbstractControl {
        return this.form.get('nominaMes');
    }

    get fechaInicial(): AbstractControl {
        return this.form.get('fechaInicial');
    }

    get fechaFinal(): AbstractControl {
        return this.form.get('fechaFinal');
    }
    
    get subperiodoId(): AbstractControl {
        return this.form.get('subperiodoId');
    }


    guardarHandle(event): void {
        const formValue = this.form.value;
        this.submit = true;

        if (formValue.fechaInicial) {
            formValue.fechaInicial = moment(formValue.fechaInicial).format('YYYY-MM-DD');
        }

        if (formValue.fechaFinal) {
            formValue.fechaFinal = moment(formValue.fechaFinal).format('YYYY-MM-DD');
        }

        if (typeof formValue.subperiodoId != 'string') {
            const array = [];
            if (formValue.subperiodoId != null) {
                formValue.subperiodoId.forEach(element => {
                    array.push(element);
                });


                formValue.subperiodoId = array.join(',');
            }
        }

        if (typeof formValue.nominaMes != 'string') {
            const array2 = [];
            if (formValue.nominaMes != null) {
                formValue.nominaMes.forEach(element => {
                    array2.push(element);
                });

                formValue.nominaMes = array2.join(',');
            }
        }

        this.espera = true;
        this._service.crear(formValue)
            .then((resp) => {
                this.espera = false;
                this.submit = false;
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                window.open(resp.url + resp.file, "_blank");
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
                if (resp.status === 400) {

                    if ('metodo' in error.errors) {
                        const errores = {};
                        error.errors.metodo.forEach(element => {
                            errores[element] = true;
                        });
                        this.metodo.setErrors(errores);
                    }

                    if ('tipoLiquidacionId' in error.errors) {
                        const errores = {};
                        error.errors.tipoLiquidacionId.forEach(element => {
                            errores[element] = true;
                        });
                        this.tipoLiquidacionId.setErrors(errores);
                    }

                    if ('subperiodoId' in error.errors) {
                        const errores = {};
                        error.errors.subperiodoId.forEach(element => {
                            errores[element] = true;
                        });
                        this.subperiodoId.setErrors(errores);
                    }

                    if ('nominaAnio' in error.errors) {
                        const errores = {};
                        error.errors.nominaAnio.forEach(element => {
                            errores[element] = true;
                        });
                        this.nominaAnio.setErrors(errores);
                    }

                    if ('nominaMes' in error.errors) {
                        const errores = {};
                        error.errors.nominaMes.forEach(element => {
                            errores[element] = true;
                        });
                        this.nominaMes.setErrors(errores);
                    }

                    if ('fechaInicial' in error.errors) {
                        const errores = {};
                        error.errors.fechaInicial.forEach(element => {
                            errores[element] = true;
                        });
                        this.fechaInicial.setErrors(errores);
                    }

                    if ('fechaFinal' in error.errors) {
                        const errores = {};
                        error.errors.fechaFinal.forEach(element => {
                            errores[element] = true;
                        });
                        this.fechaFinal.setErrors(errores);
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

                    if ('snackbarError' in error.errors) {
                        let msg = '';
                        error.errors.snackbarError.forEach(element => {
                            msg = element;
                        });
                        this._alcanosSnackBar.snackbar({
                            clase: 'error',
                            mensaje: msg,
                            time: 5000
                        });
                    }
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

        if (value.fechaInicial != null && value.fechaFinal != null) {
            formGroup.get('fechaFinal').setErrors(null);

            let fechaInicial = value.fechaInicial;
            let fechaFinal = value.fechaFinal;

            if (typeof fechaInicial === 'string') {
                fechaInicial = moment(fechaInicial).toDate();
            } else {
                fechaInicial = value.fechaInicial.toDate();
            }

            if (typeof fechaFinal === 'string') {
                fechaFinal = moment(fechaFinal).toDate();
            } else {
                fechaFinal = value.fechaFinal.toDate();
            }

            if (fechaFinal.getTime() < fechaInicial.getTime()) {
                const errors = {};
                errors['La fecha final no puede ser menor a la fecha inicial.'] = true;
                formGroup.get('fechaFinal').setErrors(errors);
            }

            if (fechaFinal.getTime() == fechaInicial.getTime()) {
                const errors = {};
                errors['La fecha final no puede ser igual a la fecha inicial.'] = true;
                formGroup.get('fechaFinal').setErrors(errors);
            }
        }

        if (value.fechaInicial != null) {

            let fechaInicial = value.fechaInicial;
            if (typeof fechaInicial === 'string') {
                fechaInicial = moment(fechaInicial).toDate();
            } else {
                fechaInicial = value.fechaInicial.toDate();
            }

            // reduce un día la fecha actual .subtract(1, 'day').toDate();
            //
            const actual = moment().toDate();
            actual.setHours(0);
            actual.setMinutes(0);
            actual.setSeconds(0);
            actual.setMilliseconds(0);

            if (fechaInicial.getTime() > actual.getTime()) {
                const errors = {};
                errors['La fecha inicial no puede ser posterior a la fecha actual.'] = true;
                formGroup.get('fechaInicial').setErrors(errors);
            }

            if (fechaInicial.getTime() == actual.getTime()) {
                const errors = {};
                errors['La fecha inicial no puede ser igual a la fecha actual.'] = true;
                formGroup.get('fechaInicial').setErrors(errors);
            }

        } // .subtract(1, 'day')

        if (value.fechaFinal != null) {

            let fechaFinal = value.fechaFinal;
            if (typeof fechaFinal === 'string') {
                fechaFinal = moment(fechaFinal).toDate();
            } else {
                fechaFinal = value.fechaFinal.toDate();
            }

            const actualFin = moment().toDate();
            actualFin.setHours(0);
            actualFin.setMinutes(0);
            actualFin.setSeconds(0);
            actualFin.setMilliseconds(0);

            // reduce un día la fecha actual .subtract(1, 'day').toDate();
            if (fechaFinal.getTime() > actualFin.getTime()) {
                const errors = {};
                errors['La fecha final no puede ser posterior a la fecha actual.'] = true;
                formGroup.get('fechaFinal').setErrors(errors);
            }
        }

        return null;
    }
}
