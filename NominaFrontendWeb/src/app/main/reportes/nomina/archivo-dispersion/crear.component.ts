import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';
import { reporteEstadoBitacora } from '@alcanos/constantes/reportes-estados';
import * as moment from 'moment';
import { MatPaginator, MatSort } from '@angular/material';
import { map, retry } from 'rxjs/operators';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ArchivoDispersionService } from './archivo-dispersion.service';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
    selector: 'archivo-dispersion-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ArchivoDispersionComponent implements OnInit, AfterContentChecked {
    form: FormGroup;
    formFecha: FormGroup;
    submit: boolean;
    tipoLiquidacionOptions: any[];
    _this: ArchivoDispersionComponent;
    item: any;
    espera: boolean = false;
    dataRequest: boolean;
    filtroChange: BehaviorSubject<any>;
    entidadesFinancieras: any;
    cuentaBancos: any;

    // listar
    selection = new SelectionModel<any>(true, []);
    dataSource: FilesDataSource | null;
    displayedColumns: string[] = ['seleccion', 'tipoLiquidacion', 'subperiodo', 'fechaInicial', 'fechaFinal', 'valorTotal'];
    countTotal: number;
    // @ViewChild(MatPaginator, { static: true })
    // paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    loadData: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: ArchivoDispersionService,
        private cdref: ChangeDetectorRef
    ) {
        this.tipoLiquidacionOptions = [];
        this.formFecha = this._formBuilder.group({
            fechaInicial: [null, [Validators.required]],
            fechaFinal: [null, [Validators.required]],
        }, { validators: this.validate });

        this.form = this._formBuilder.group({
            seleccion: [null, []],
            entidadFinanciera: [null, [Validators.required]],
            cuentaBancariaId: [null, [Validators.required]],
        });
        this.submit = false;
        let c = 0;
        const unmes = moment().subtract(1, 'months').format('YYYY-MM-DD');
        const actual = moment().format('YYYY-MM-DD');
        this.formFecha.patchValue({ fechaInicial: unmes, fechaFinal: actual });

        this._service.getEntidadFinancieras().then(resp => {
            this.entidadesFinancieras = resp;
            this.entidadesFinancieras.forEach(resp => {
                if (resp.entidadPorDefecto && c === 0) {
                    this.form.patchValue({ entidadFinanciera: resp.id });
                    this._bancario(resp.id);
                    c++;
                }
            });
        });
        this.countTotal = 0;

    }

    ngOnInit(): void {
        this.dataSource = new FilesDataSource(this._service, this.sort);
        this.form.get('seleccion').setErrors(null);

        this.form.get('entidadFinanciera').valueChanges.subscribe(value => {
            //this.form.get('cuentaBancaria').setValue(null);
            this.cuentaBancos = [];
            if (this.loadData || value != null) {
                this._bancario(value);
            }
        });
    }

    ngOnDestroy(): void {
        this.dataSource = null;
        this.selection = null;
        this._service.infoData = [];
        this._service.onArchivoDispersionChange.next([]);
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.dataOriginalLength;
        return numSelected === numRows;
    }

    ngAfterContentChecked(): void {
        this.cdref.detectChanges();
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): void {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.dataOriginal.forEach(row => this.selection.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) { return `${this.isAllSelected() ? 'select' : 'deselect'} all`; }

        if (this.selection.selected.length === 0) {
            this.form.get('seleccion').setErrors({ 'required': true });
        } else {
            this.form.get('seleccion').updateValueAndValidity();
        }

        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;

    }

    get hasSelected(): boolean {
        return this.selection.selected.length > 0;
    }

    get dataLength(): number {
        if (!this.dataSource) {
            return 0;
        }
        return this.dataSource.length;
    }

    get dataOriginalLength(): number {
        return this._service.totalCount;
    }

    get entidadFinanciera(): AbstractControl {
        return this.form.get('entidadFinanciera');
    }

    get cuentaBancariaId(): AbstractControl {
        return this.form.get('cuentaBancariaId');
    }

    get fechaInicial(): AbstractControl {
        return this.form.get('fechaInicial');
    }

    get fechaFinal(): AbstractControl {
        return this.form.get('fechaFinal');
    }

    buscarFechaHandle(event): void {
        // reset
        this.loadData = false;
        this.form.get('seleccion').setErrors({ 'required': true });
        this.form.get('entidadFinanciera').setValue(null);
        let c = 0;
        this.entidadesFinancieras.forEach(resp => {
            if (resp.entidadPorDefecto && c === 0) {
                this.form.patchValue({ entidadFinanciera: resp.id });
                this._bancario(resp.id);
                c++;
            }
        });
        this.form.get('cuentaBancariaId').setValue(null);

        const formFechaValue = this.formFecha.value;
        formFechaValue.fechaInicial = moment(formFechaValue.fechaInicial).format('YYYY-MM-DD');
        formFechaValue.fechaFinal = moment(formFechaValue.fechaFinal).add(1, "days").format('YYYY-MM-DD');
        if (formFechaValue.fechaInicial !== 'Invalid date' && formFechaValue.fechaFinal !== 'Invalid date') {
            this._service._getNominaValorTotal(formFechaValue.fechaInicial, formFechaValue.fechaFinal).then(data => {
                setTimeout(() => {
                    this.espera = true;
                    setTimeout(() => {
                        this.countTotal = data.length;
                        this.espera = false;
                    }, 300);
                    setTimeout(() => {
                        this.loadData = true;
                        this.espera = false;
                    }, 800);
                }, 100);

            }).catch(data => {
                this._alcanosSnackBar.snackbar({ clase: 'error' });
                this.loadData = false;
                this.countTotal = 0;
                this.espera = false;
            });
        }
    }

    guardarHandle(event): void {
        this.espera = true;
        const formValue = this.form.value;
        this.submit = true;

        if (formValue.fechaInicial) {
            formValue.fechaInicial = moment(formValue.fechaInicial).format('YYYY-MM-DD');
        }

        if (formValue.fechaFinal) {
            formValue.fechaFinal = moment(formValue.fechaFinal).format('YYYY-MM-DD');
        }

        const valorTotales: any = [];
        this.selection.selected.forEach(element => {
            valorTotales.push(element.id);
        });
        formValue.liquidaciones = valorTotales;
        this._service.crear(formValue)
            .then((resp) => {
                this.submit = false;
                this.espera = false;
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                // window.open(resp.url + resp.file, 'Archivo a descargar', 'resizable,scrollbars,status');
                fetch(resp.url + resp.file, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                })
                    .then((response) => response.blob())
                    .then((blob) => {
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', resp.file.replace('/public/', ''));
                       // console.log(resp.file.replace('/public/', ''));
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
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
                if (resp.status === 400) {


                    if ('entidadFinanciera' in error.errors) {
                        const errores = {};
                        error.errors.entidadFinanciera.forEach(element => {
                            errores[element] = true;
                        });
                        this.entidadFinanciera.setErrors(errores);
                    }

                    if ('cuentaBancariaId' in error.errors) {
                        const errores = {};
                        error.errors.cuentaBancariaId.forEach(element => {
                            errores[element] = true;
                        });
                        this.cuentaBancariaId.setErrors(errores);
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

    private _bancario(bancariaId): void {
        this._service.getCuentaBancarias(bancariaId).then((response: any[]) => {
            this.cuentaBancos = response;
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
                errors['La fecha final no puede ser menor a la fecha de inicio.'] = true;
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
                errors['La fecha de inicio no puede ser mayor a la fecha actual.'] = true;
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
                errors['La fecha final no puede ser mayor a la fecha actual.'] = true;
                formGroup.get('fechaFinal').setErrors(errors);
            }
        }

        return null;
    }

}


export class FilesDataSource extends DataSource<any>{

    public length = 0;

    constructor(
        private _service: ArchivoDispersionService,
        private _matSort: MatSort,
    ) {
        super();
    }

    connect(): Observable<any[]> {
        const displayDataChanges = [
            this._service.onArchivoDispersionChange,
            this._matSort.sortChange,
        ];

        return merge(...displayDataChanges)
            .pipe(
                map(() => {
                    let data = this._service.infoData.slice();
                    data = this.sortData(data);
                    return data;
                }
                ));
    }

    get dataOriginal(): any[] {
        return this._service.infoData;
    }

    get dataOriginalLength(): number {
        return this._service.infoData.length;
    }

    /**
     * Sort data
     *
     * @param data
     * @returns {any[]}
     */
    sortData(data): any[] {
        if (!this._matSort.active || this._matSort.direction === '') {
            return data;
        }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this._matSort.active) {
                case 'tipoLiquidacion':
                    [propertyA, propertyB] = [a.tipoLiquidacion, b.tipoLiquidacion];
                    break;
                case 'subperiodo':
                    [propertyA, propertyB] = [a.subperiodo, b.subperiodo];
                    break;
                case 'fechaInicial':
                    [propertyA, propertyB] = [a.fechaInicial, b.fechaInicial];
                    break;
                case 'fechaFinal':
                    [propertyA, propertyB] = [a.fechaFinal, b.fechaFinal];
                    break;
                case 'valorTotal':
                    [propertyA, propertyB] = [a.valorTotal, b.valorTotal];
                    break;

            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._matSort.direction === 'asc' ? 1 : -1);
        });
    }

    disconnect(): void {
    }



}

