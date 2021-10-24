import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';

import * as moment from 'moment';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { CurrencyPipe } from '@angular/common';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosSharedModule } from '@alcanos/shared.module';

@Component({
    selector: 'formulario-embargos',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

    enviroments: string = environmentAlcanos.gestorArchivos;

    form: FormGroup;
    submit: boolean;
    item: any;

    tipoEmbargos: any[];
    subPeriodos: any[];
    entidadFinancieras: any[];
    actualizaPrioridad: boolean;
    valorEmbargo: any;
    tipoPeriodosInicial: any;
    tipoPeriodos: any;

    tipoPeriodosOrigen = [];
    subPeriodosOrigen = [];

    desabilitar: boolean = false;
    id: number;

    conceptoNomina: any[];
    embargoConceptoNomina = [];
    embargoConceptoNominaDatos = [];

    filteredFuncionarios: Observable<string[]>;
    filteredJuzgados: Observable<string[]>;

    /**
     * 
     * @param _formBuilder 
     * @param _matDialog 
     * @param _router 
     * @param _service 
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _router: Router,
        private _service: FormularioService,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private currencyPipe: CurrencyPipe,
    ) {
        this.submit = false;

        this.tipoEmbargos = [];
        this.subPeriodos = [];
        this.entidadFinancieras = [];
        this.actualizaPrioridad = false;

        this.tipoEmbargos = this._service.onTipoEmbargosChanged.value;
        this.entidadFinancieras = this._service.onEntidadFinancierasChanged.value;
        this.tipoPeriodosInicial = this._service.onTipoPeriodosChanged.value;

        // llena todo tipo de embargo
        this.embargoConceptoNomina = this._service.onEmbargoConceptoNominasChanged.value;
        this.form = this._formBuilder.group({
            id: [null, []],
            actualizaPrioridad: [null, []],
            funcionario: [null, [Validators.required]],
            juzgado: [null, []],
            numeroProceso: [null, [AlcanosValidators.maxLength(100)]],
            tipoEmbargoId: [null, [Validators.required]],
            prioridad: [null, [Validators.required, AlcanosValidators.numerico, Validators.min(1), Validators.max(99)]],
            numeroCuenta: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(30)]],
            valorEmbargo: [null, []],
            tipoPeriodo: [null, [Validators.required]],
            subPeriodoId: [null, [Validators.required]],
            porcentajeCuota: [null, []],
            conceptoNominaId: [null, [Validators.required]],
            digitoVerificacionDemandante: [null, [AlcanosValidators.numerico, AlcanosValidators.maxLength(1)]],
            valorCuota: [null, []],
            entidadFinancieraId: [null, [Validators.required]],
            numeroDocumentoDemandante: [null, [Validators.required, AlcanosValidators.numerico, AlcanosValidators.maxLength(15)]],
            demandante: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
            fechaInicio: [null, []],
            fechaFin: [null, []]
        }, { validator: this.validateDatosBasicos });
    }

    ngOnInit(): void {

        this._service.onItemChanged.subscribe(
            (response: any) => {
                this.item = response;
                if (response != null) {

                    this.id = this.item.id;

                    this.desabilitar = true;
                    let tipoPeriodo: any = null;
                    let tipoPeriodoOrigen = null;
                    const subPeriodos = [];
                    let tipoPeriodoId: number;
                    const arrayConcat = [];

                    if (this.item.embargoSubperiodos.length > 0) {
                        this.item.embargoSubperiodos.forEach(resp => {
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

                    this._service.getConceptoNominas(this.item.tipoEmbargoId).then(resp => {
                        this.conceptoNomina = resp;
                    });

                    if (this.item.embargoSubperiodos != null) {
                        this.item.embargoSubperiodos.forEach(element => {
                            subPeriodos.push(element.subPeriodoId);
                        });
                    }

                    const arrayEmbargoConceptoNomina = [];
                    this.embargoConceptoNomina.forEach(resp => {
                        arrayEmbargoConceptoNomina.push(resp.conceptoNominaId);
                    });

                    this.form.patchValue({
                        id: this.item.id,
                        funcionario: this.item.funcionario,
                        juzgado: this.item.juzgado,
                        tipoEmbargoId: this.item.tipoEmbargoId,
                        numeroProceso: this.item.numeroProceso,
                        valorEmbargo: this.item.valorEmbargo,
                        tipoPeriodo: tipoPeriodoOrigen,
                        porcentajeCuota: this.item.porcentajeCuota,
                        digitoVerificacionDemandante: this.item.digitoVerificacionDemandante,
                        subPeriodoId: subPeriodos,
                        conceptoNominaId: arrayEmbargoConceptoNomina,
                        valorCuota: this.item.valorCuota,
                        prioridad: this.item.prioridad,
                        entidadFinancieraId: this.item.entidadFinancieraId,
                        numeroCuenta: this.item.numeroCuenta,
                        numeroDocumentoDemandante: this.item.numeroDocumentoDemandante,
                        demandante: this.item.demandante,
                        fechaInicio: this.item.fechaInicio,
                        fechaFin: this.item.fechaFin,
                    });
                    this.form.get('funcionario').disable();
                    this.form.get('tipoEmbargoId').disable();
                    this.form.markAllAsTouched();
                }
            }
        );

        this.form.get('tipoPeriodo').valueChanges.subscribe((value) => {
            this.subPeriodos = [];
            this.form.get('subPeriodoId').setValue(null);
            if (value != null) {
                this._periodicidad(value, this.subPeriodos);
            }
        });


        this.form.get('tipoEmbargoId').valueChanges.subscribe((value) => {
            // llamamos todo el embargo / segmentado por el tipo embargo 
            this._service.getConceptoNominas(value).then(resp => {
                this.conceptoNomina = resp;
            });
        });

        this.filteredFuncionarios = this.form.get('funcionario')
            .valueChanges
            .pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );

        this.filteredJuzgados = this.form.get('juzgado')
            .valueChanges
            .pipe(
                debounceTime(300),
                switchMap(value => this._service.getJuzgados(value))
            );

    }

    valueOnChange(event, type): void {
        const val = this.form.get(type).value;
        const formato = this.formatNumber(val);
        this.form.get(type).setValue(formato);
    }

    formatNumber(n): any {
        return n.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',').trim();
    }

    ngAfterViewInit(): void {
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

    // Este proceso se desabilita a raiz de la nueva versión realizada por QA
    procesoLeave(event): void {
        const funcionarioId = this.form.get('funcionario').value;
        if (funcionarioId != null && event.target.value != null && (event.target.value).trim() !== '') {
            this._service.prioridad(funcionarioId.id, event.target.value).then((resp) => {
                if (resp['@odata.count'] != 0) {
                    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
                        disableClose: false,
                        data: {
                            mensaje: `Ya existe un embargo con prioridad No. ${event.target.value}. Si guardas este embargo, los demás que estén asociados al funcionario se actualizarán. ¿Estás seguro de continuar?`,
                            clase: 'error',
                        }
                    });
                    dialogRef.afterClosed().subscribe(confirm => {
                        if (confirm) {
                            this.actualizaPrioridad = true;
                        } else {
                            this.actualizaPrioridad = false;
                        }
                    });
                }
            });
        }
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;


        formValue.valorEmbargo = parseFloat(formValue.valorEmbargo);
        formValue.valorCuota = parseFloat(formValue.valorCuota);
        formValue.EmbargosSubperiodo = null;
        formValue.EmbargosConceptoNomina = null;

        if (formValue.subPeriodoId != null) {
            const array: any[] = [];
            formValue.subPeriodoId.forEach(element => {
                array.push({ subPeriodoId: element });
            });
            formValue.EmbargosSubperiodo = array;
        }

        if (formValue.conceptoNominaId != null) {
            const arrayConcepto: any[] = [];
            formValue.conceptoNominaId.forEach(element => {
                arrayConcepto.push({ conceptoNominaId: element });
            });
            formValue.EmbargosConceptoNomina = arrayConcepto;
        }

        formValue.actualizaPrioridad = this.actualizaPrioridad;
        if (formValue.tipoEmbargoId == null) {
            formValue.tipoEmbargoId = this.item.tipoEmbargoId;
        }
        if (formValue.funcionario == null && formValue.id != null) {
            formValue.funcionarioId = this.item.funcionarioId;
        }
        else {
            formValue.funcionarioId = formValue.funcionario.id;
        }

        if (formValue.juzgado == null && formValue.id != null) {
            formValue.juzgadoId = this.item.juzgadoId;
        } else {
            if (formValue.juzgado != null) {
                formValue.juzgadoId = formValue.juzgado.id;
            }
        }

        if (formValue.fechaInicio != null) {
            formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
        }
        if (formValue.fechaFin != null) {
            formValue.fechaFin = moment(formValue.fechaFin).format('YYYY-MM-DDTHH:mm:ssZ');
        }

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._router.navigate([`/novedades/embargos/`]);
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
                    if ('snackbar' in error.errors) {
                        const errors = {};
                        error.errors.snackbar.forEach(element => {
                            this._alcanosSnackBar.snackbar({
                                clase: 'error',
                                mensaje: element,
                                time: 6000
                            });
                        });
                    }

                    if ('actualizaPrioridad' in error.errors) {
                        const errors = {};
                        error.errors.actualizaPrioridad.forEach(element => {
                            const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
                                disableClose: false,
                                data: {
                                    mensaje: element,
                                    clase: 'informativo',
                                }
                            });
                            dialogRef.afterClosed().subscribe(confirm => {
                                if (confirm) {
                                    if (confirm) {
                                        this.actualizaPrioridad = true;
                                    } else {
                                        this.actualizaPrioridad = false;
                                    }
                                }
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

                    if ('funcionario' in error.errors) {
                        const errors = {};
                        error.errors.funcionario.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionario').setErrors(errors);
                    }

                    if ('funcionario' in error.errors) {
                        const errors = {};
                        error.errors.funcionario.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionario').setErrors(errors);
                    }

                    if ('juzgado' in error.errors) {
                        const errors = {};
                        error.errors.juzgado.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('juzgado').setErrors(errors);
                    }

                    if ('tipoEmbargoId' in error.errors) {
                        const errors = {};
                        error.errors.tipoEmbargoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('tipoEmbargoId').setErrors(errors);
                    }

                    if ('numeroProceso' in error.errors) {
                        const errors = {};
                        error.errors.numeroProceso.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('numeroProceso').setErrors(errors);
                    }

                    if ('digitoVerificacionDemandante' in error.errors) {
                        const errors = {};
                        error.errors.digitoVerificacionDemandante.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('digitoVerificacionDemandante').setErrors(errors);
                    }

                    if ('porcentajeCuota' in error.errors) {
                        const errors = {};
                        error.errors.porcentajeCuota.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('porcentajeCuota').setErrors(errors);
                    }

                    if ('embargosConceptoNomina' in error.errors) {
                        const errors = {};
                        error.errors.embargosConceptoNomina.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('conceptoNominaId').setErrors(errors);
                    }

                    if ('valorEmbargo' in error.errors) {
                        const errors = {};
                        error.errors.valorEmbargo.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('valorEmbargo').setErrors(errors);
                    }

                    if ('subPeriodoId' in error.errors) {
                        const errors = {};
                        error.errors.subPeriodoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('subPeriodoId').setErrors(errors);
                    }

                    if ('valorCuota' in error.errors) {
                        const errors = {};
                        error.errors.valorCuota.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('valorCuota').setErrors(errors);
                    }

                    if ('prioridad' in error.errors) {
                        const errors = {};
                        error.errors.prioridad.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('prioridad').setErrors(errors);
                    }

                    if ('entidadFinancieraId' in error.errors) {
                        const errors = {};
                        error.errors.entidadFinancieraId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('entidadFinancieraId').setErrors(errors);
                    }

                    if ('numeroDocumentoDemandante' in error.errors) {
                        const errors = {};
                        error.errors.numeroDocumentoDemandante.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('numeroDocumentoDemandante').setErrors(errors);
                    }

                    if ('demandante' in error.errors) {
                        const errors = {};
                        error.errors.demandante.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('demandante').setErrors(errors);
                    }

                    if ('fechaInicio' in error.errors) {
                        const errors = {};
                        error.errors.fechaInicio.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaInicio').setErrors(errors);
                    }

                    if ('fechaFin' in error.errors) {
                        const errors = {};
                        error.errors.fechaFin.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaFin').setErrors(errors);
                    }

                }
            });
    }

    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validateDatosBasicos(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;
        if (value != null) {
            if (value.fechaFin && !value.fechaInicio) {
                formGroup.get('fechaInicio').markAllAsTouched();
                formGroup.get('fechaInicio').setErrors({ 'Si ingresas la fecha fin, se requiere la fecha inicio.': true });
            }

            if (value.id == null) {
                if (value.fechaInicio) {
                    let fechaIn2 = value.fechaInicio;
                    const hoy = moment().subtract(1, 'day').toDate();
                    if (typeof fechaIn2 === 'string') {
                        fechaIn2 = moment(fechaIn2).toDate();
                    } else {
                        fechaIn2 = value.fechaInicio;
                    }
                    if (hoy >= fechaIn2) {
                        formGroup.get('fechaInicio').setErrors({ 'La fecha de inicio no puede ser menor a la fecha actual.': true });
                    }
                }
            }

            if (value.fechaFin && value.fechaInicio) {
                let fechaIn = value.fechaInicio;
                let fechaOut = value.fechaFin;

                const errors = Object.assign({}, formGroup.get('fechaFin').errors);
                const mensaje = 'La fecha fin que intentas guardar no puede ser menor que la fecha inicio.';

                if (typeof fechaIn === 'string') {
                    fechaIn = moment(fechaIn).toDate();
                } else {
                    fechaIn = value.fechaInicio.toDate();
                }

                if (typeof fechaOut === 'string') {
                    fechaOut = moment(fechaOut).add(1, 'day').toDate();
                } else {
                    fechaOut = moment(value.fechaFin).add(1, 'day').toDate();
                }

                if (fechaOut.getTime() <= fechaIn.getTime()) {
                    errors[mensaje] = true;
                } else {
                    delete errors[mensaje];
                }

                if (Object.keys(errors).length > 0) {
                    formGroup.get('fechaFin').setErrors(errors);
                } else {
                    formGroup.get('fechaFin').setErrors(null);
                }
            }
        }

        if (value.numeroDocumentoDemandante != null && value.digitoVerificacionDemandante != null) {
            let vpri, x, y, z;
            // Procedimiento
            vpri = new Array(16);
            z = `${value.numeroDocumentoDemandante}`.length;

            vpri[1] = 3;
            vpri[2] = 7;
            vpri[3] = 13;
            vpri[4] = 17;
            vpri[5] = 19;
            vpri[6] = 23;
            vpri[7] = 29;
            vpri[8] = 37;
            vpri[9] = 41;
            vpri[10] = 43;
            vpri[11] = 47;
            vpri[12] = 53;
            vpri[13] = 59;
            vpri[14] = 67;
            vpri[15] = 71;

            x = 0;
            y = 0;
            for (let i = 0; i < z; i++) {
                y = (`${value.numeroDocumentoDemandante}`.substr(i, 1));
                x += (y * vpri[z - i]);
            }
            y = x % 11;
            const dv = (y > 1) ? 11 - y : y;
            if (value.digitoVerificacionDemandante != "") {
                if (!(!isNaN(dv) && dv == value.digitoVerificacionDemandante)) {
                    const errors = Object.assign({}, formGroup.get('digitoVerificacionDemandante').errors);
                    errors[`El DV  es incorrecto, por favor verifica.`] = true;
                    formGroup.get('digitoVerificacionDemandante').setErrors(errors);

                }
                if ((!isNaN(dv) && dv == value.digitoVerificacionDemandante)) {
                    formGroup.get('digitoVerificacionDemandante').setErrors(null);
                }
            }
        }
        return null;
    }


    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    displayFn(element: any): string {
        return element ? element.nombre : element;
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
