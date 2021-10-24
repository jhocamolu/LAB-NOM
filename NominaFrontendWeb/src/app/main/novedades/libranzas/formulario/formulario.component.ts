import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';

import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
    selector: 'libranzas-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    submit: boolean;
    item: any;
    id: number;

    desabilitar: boolean = false;


    tipoEmbargos: any[];
    subPeriodos: any[];

    tipoPeriodosInicial: any;
    tipoPeriodos: any;

    tipoPeriodosOrigen = [];
    subPeriodosOrigen = [];

    funcionarios: any[];
    entidadFinancierasOptions: any[];

    filteredFuncionarios: Observable<string[]>;


    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _service: FormularioService,

    ) {
        this.funcionarios = [];
        this.entidadFinancierasOptions = this._service.onEntidadFinancierasChanged.value;
        this.tipoPeriodosInicial = this._service.onTipoPeriodosChanged.value;
        this.subPeriodos = [];
        this.form = this._formBuilder.group({
            id: [null],
            funcionario: [null, [Validators.required]],
            fechaInicio: [null, [Validators.required]],
            valorPrestamo: [null, [Validators.required]],
            valorCuota: [null, [Validators.required]],
            tipoPeriodo: [null, [Validators.required]],
            subPeriodoId: [null, [Validators.required]],
            numeroCuotas: [null, [AlcanosValidators.numerico, Validators.max(1000)]],
            entidadFinancieraId: [null, [Validators.required]],
            observacion: [null, []],

        }, { validators: this.validate });
        this.submit = false;
    }

    ngOnInit(): void {

        this._service.onItemChanged.subscribe(resp => {
            if (resp != null) {
                this.desabilitar = true;
                this.item = resp;
                this.id = this.item.id;

                let tipoPeriodo: any = null;
                let tipoPeriodoOrigen = null;
                const subPeriodos = [];
                let tipoPeriodoId: number;
                const arrayConcat = [];

                if (this.item.libranzaSubperiodos.length > 0) {
                    this.item.libranzaSubperiodos.forEach(resp => {
                        tipoPeriodo = resp.subPeriodo.tipoPeriodo;
                        tipoPeriodoId = resp.subPeriodo.tipoPeriodoId;
                    });
                    if (tipoPeriodo.pagoPorDefecto) {
                        tipoPeriodoOrigen = tipoPeriodo.id;
                        this._periodicidad(tipoPeriodoOrigen, this.subPeriodos);
                    } else {
                        this._service.getTipoPeriodosId(tipoPeriodoId).then(resp => {
                            arrayConcat.push(resp);
                        });
                        this.tipoPeriodosInicial.value.forEach(element => {
                            arrayConcat.push(element);
                        });
                        this.tipoPeriodosInicial.value = arrayConcat;
                        tipoPeriodoOrigen = tipoPeriodo.id;
                        this._periodicidad(tipoPeriodoOrigen, this.subPeriodos);
                    }
                }

                if (this.item.libranzaSubperiodos != null) {
                    this.item.libranzaSubperiodos.forEach(element => {
                        subPeriodos.push(element.subPeriodoId);
                    });
                }

                this.form.patchValue({
                    id: this.item.id,
                    funcionario: this.item.funcionario,
                    fechaInicio: this.item.fechaInicio,
                    valorPrestamo: this.item.valorPrestamo,
                    valorCuota: this.item.valorCuota,
                    numeroCuotas: this.item.numeroCuotas,
                    entidadFinancieraId: this.item.entidadFinancieraId,
                    observacion: this.item.observacion,
                    tipoPeriodo: tipoPeriodoOrigen,
                    subPeriodoId: subPeriodos,
                });


                this.form.markAllAsTouched();

                // Desabilitar campos en el editar
                this.form.get('funcionario').disable();

            }
        });

        this.form.get('tipoPeriodo').valueChanges.subscribe((value) => {
            this.subPeriodos = [];
            this.form.get('subPeriodoId').setValue(null);
            if (value != null) {
                this._periodicidad(value, this.subPeriodos);
            }
        });

        this.filteredFuncionarios = this.form.get('funcionario')
            .valueChanges
            .pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );
    }

    ngAfterViewInit(): void {
    }

    get numeroCuotas(): AbstractControl {
        return this.form.get('numeroCuotas');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    strToDateFormat(str: string): string {
        moment.locale('es');
        return moment(str).format('MMM DD, Y  ');
    }

    focusData(event): void {
        if (this.form.value.funcionario && this.form.value.funcionario.id) {
            // CA 01 - 02 HU061 V1
            this._service.getDatosActuales(this.form.value.funcionario.id)
                .then(resp => {
                    const errors = {};
                    if (resp.contrato != null) {
                        if (resp.contrato.estado !== 'Vigente') {
                            errors[
                                'El funcionario que intentas ingresar no cuenta con un contrato vigente, por favor revisa.'
                            ] = true;
                            this.form.get('funcionario').setErrors(errors);
                        }
                        if (resp.estado !== 'Activo') {
                            errors[
                                'El funcionario que intentas ingresar no se encuentra activo, por favor revisa.'
                            ] = true;
                            this.form.get('funcionario').setErrors(errors);
                        }
                    } else {
                        errors[
                            'El funcionario no tiene contrato.'
                        ] = true;
                        this.form.get('funcionario').setErrors(errors);
                    }
                });
        }
    }

    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validate(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;

        if (value.id == null) {
            if (value.fechaInicio) {
                const fechaInicio = moment(value.fechaInicio).toDate();
                const fechaActual = new Date(
                    new Date().setDate(new Date().getDate() - 1)
                );
                formGroup.get('fechaInicio').setErrors(null);

                if (fechaInicio.getTime() < fechaActual.getTime()) {
                    const errors = {};
                    errors['La fecha de inicio no debe ser menor a la fecha actual.'] = true;
                    formGroup.get('fechaInicio').setErrors(errors);
                }
            }
        }

        if (value.funcionario != null && typeof value.funcionario !== 'object') {
            const errors = {};
            errors['Por favor, seleccione un funcionario.'] = true;
            formGroup.get('funcionario').setErrors(errors);
        }

        return null;
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;

        formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
        formValue.libranzasSubperiodo = null;

        if (formValue.funcionario == null) {
            formValue.funcionarioId = this.item.funcionario.id;
        }
        else {
            formValue.funcionarioId = formValue.funcionario.id;
        }

        if (formValue.subPeriodoId != null) {
            const array: any[] = [];
            formValue.subPeriodoId.forEach(element => {
                array.push({ subPeriodoId: element });
            });
            formValue.libranzasSubperiodo = array;
        }

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._router.navigate([`/novedades/libranzas`]);
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
                    if ('funcionario' in error.errors) {
                        const errors = {};
                        error.errors.funcionario.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionario').setErrors(errors);
                    }

                    if ('fechaInicio' in error.errors) {
                        const errors = {};
                        error.errors.fechaInicio.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaInicio').setErrors(errors);
                    }
                    if ('valorPrestamo' in error.errors) {
                        const errors = {};
                        error.errors.valorPrestamo.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('valorPrestamo').setErrors(errors);
                    }
                    if ('numeroCuotas' in error.errors) {
                        const errors = {};
                        error.errors.numeroCuotas.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('numeroCuotas').setErrors(errors);
                    }
                    if ('entidadFinancieraId' in error.errors) {
                        const errors = {};
                        error.errors.entidadFinancieraId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('entidadFinancieraId').setErrors(errors);
                    }
                    if ('observacion' in error.errors) {
                        const errors = {};
                        error.errors.observacion.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('observacion').setErrors(errors);
                    }

                    if ('libranzasSubperiodo' in error.errors) {
                        const errors = {};
                        error.errors.libranzasSubperiodo.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('subPeriodoId').setErrors(errors);
                    }

                    if ('tipoPeriodoId' in error.errors) {
                        const errors = {};
                        error.errors.tipoPeriodoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('tipoPeriodo').setErrors(errors);
                    }
                    if ('valorCuota' in error.errors) {
                        const errors = {};
                        error.errors.valorCuota.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('valorCuota').setErrors(errors);
                    }
                }
                // this._matSnackBar.open(mensaje, 'Aceptar', {
                //   verticalPosition: 'top',
                //   duration: 9000,
                //   panelClass: ['error-snackbar'],
                // });
            });

    }


    displayFnFuncionarios(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

    private _periodicidad(periodicidadId, array: any[]): void {

        this._service.getSubPeriodos(periodicidadId).then((response: any[]) => {
            response.forEach(element => {
                array.push(element);
            });
        }
        );
    }

}
