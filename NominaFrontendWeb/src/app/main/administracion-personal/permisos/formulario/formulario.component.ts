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
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { DocumentosComponent } from '../documentos/documentos.component';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'formulario-novedades',
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

    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<string[]>;

    selectedTab = 0;
    id: number;
    claseAusentismo: any[];
    tipoAusentismos: any[];

    soportes: any[];
    count: any;
    timeHoras: boolean;
    arrayPermisosSoporte: any;
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
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: FormularioService,
        private _permisos: PermisosrService
    ) {
        this.arrayPermisosSoporte = this._permisos.permisosStorage('SoporteSolicitudPermiso_')
        this.selectedTab = this._service.selectedTab;
        this.submit = false;
        this.timeHoras = false;
        this.id = null;

        this.form = this._formBuilder.group({
            id: [null, []],
            funcionario: [null, [Validators.required]],
            tipoAusentismoClase: [null, [Validators.required]],
            tipoAusentismoTipo: [null, [Validators.required]],
            fechaInicio: [null, [Validators.required]],
            fechaFin: [null, [Validators.required]],
            horaSalida: [null, []],
            horaLlegada: [null, []],
            observaciones: [null, []],
        }, { validators: this.validate });
    }

    ngOnInit(): void {

        this._service.getClaseAusentismo().then((resp) => {
            this.claseAusentismo = resp;
        });

        this._service.onItemChanged.subscribe(
            (response: any) => {
                this.item = response;



                if (response != null) {

                    this.id = this.item.id;

                    if (this.item.tipoAusentismo != null) {
                        this._service.getTipoAusentismos(this.item.tipoAusentismo.claseAusentismoId).then((resp) => {
                            this.tipoAusentismos = resp;
                        });
                    }

                    this.timeHoras = this.item.tipoAusentismo.claseAusentismo.requiereHora;

                    this._service.getSoportePermisos().then((resp) => {
                        this.soportes = resp.value;
                        this.count = resp['@odata.count'];
                    });

                    this.form.patchValue({
                        id: this.item.id,
                        funcionario: this.item.funcionario,
                        tipoAusentismoClase: this.item.tipoAusentismo.claseAusentismoId,
                        tipoAusentismoTipo: this.item.tipoAusentismoId,
                        fechaInicio: this.item.fechaInicio,
                        fechaFin: this.item.fechaFin,
                        horaSalida: (this.item.horaSalida) ? moment(`2000-01-01 ${this.item.horaSalida}`).format('HH:mm:ss') : null,
                        horaLlegada: (this.item.horaLlegada) ? moment(`2000-01-01 ${this.item.horaLlegada}`).format('HH:mm:ss') : null,
                        observaciones: this.item.observaciones
                    });

                    this.form.get('funcionario').disable();
                    this.form.get('tipoAusentismoClase').disable();
                    this.form.markAllAsTouched();
                }
            }
        );


        this.form.get('fechaInicio').valueChanges.subscribe(
            (value) => {
                if (this.id == null && this.timeHoras == true) {

                    const fechaInicio = moment(value).toDate();
                    const fechaActual = new Date(new Date().setDate(new Date().getDate() - 1));
                    this.form.get('fechaFin').setErrors(null);
                    if (!(fechaInicio.getTime() < fechaActual.getTime())) {
                        this.form.get('fechaFin').setValue(value);
                    }
                }
            }
        );

        this.form.get('tipoAusentismoClase').valueChanges.subscribe(
            (value) => {
                this.tipoAusentismos = [];
                this.form.get('tipoAusentismoTipo').setValue(null);
                if (value != null) {
                    this._tipoAusentismo(value, this.tipoAusentismos);
                }

                if (value != null) {
                    this._service.getClaseRequiereHora(value).then(resp => {
                        this.timeHoras = resp.requiereHora;
                        if (resp.requiereHora) {
                            if (this.item == null) {
                                this.form.get('horaSalida').setValue('00:00');
                                this.form.get('horaLlegada').setValue('12:00');
                            }
                        } else {
                            this.form.get('horaSalida').setValue(null);
                            this.form.get('horaLlegada').setValue(null);
                        }
                    });
                }
            }
        );

        this.filteredFuncionarios = this.form
            .get('funcionario').valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );
    }


    // se comunica con el componente Dependencia
    soporteHandle(event, element): void {
        const dialogRef = this._matDialog.open(DocumentosComponent, {
            panelClass: 'modal-dialog',
            data: element,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined' && result != null) {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._service.getSoportePermisos().then((resp) => {
                    this.soportes = resp.value;
                    this.count = resp['@odata.count'];
                });
                this.selectedTab = 1;
            }
        });
    }

    ngAfterViewInit(): void { }

    tabChangeHandle(event): void {
        this.selectedTab = event.index;
    }

    public deleteSoporteHandle(event, id): void {
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
                clase: 'error',
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this._service.borrar(id).then(() => {
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                    this._service.getSoportePermisos().then((resp) => {
                        this.soportes = resp.value;
                        this.count = resp['@odata.count'];
                    });

                });
            }
        });
    }

    focusData(event): void {
        if (this.form.value.funcionario && this.form.value.funcionario.id) {
            this._service
                .getDatosActuales(this.form.value.funcionario.id)
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

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;

        if (formValue.funcionario == null && this.item.id != null) {
            formValue.funcionarioId = this.item.funcionarioId;
        }
        else {
            formValue.funcionarioId = formValue.funcionario.id;
        }

        formValue.tipoAusentismoId = formValue.tipoAusentismoTipo;
        // HH:mm:ssZ
        formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DD');
        formValue.fechaFin = moment(formValue.fechaFin).format('YYYY-MM-DD');

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                // this.segundo();
                this.submit = false;
                this.selectedTab = 1;
                this._router.routeReuseStrategy.shouldReuseRoute = () => false;
                this._router.onSameUrlNavigation = 'reload';
                this._router.navigate([`/administracion-personal/permisos/${resp.id}/editar`], { queryParams: { tab: 1 } });

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

                    if ('funcionarios' in error.errors) {
                        const errors = {};
                        error.errors.funcionarios.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionarios').setErrors(errors);
                    }

                    if ('tipoAusentismoClase' in error.errors) {
                        const errors = {};
                        error.errors.tipoAusentismoClase.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('tipoAusentismoClase').setErrors(errors);
                    }

                    if ('tipoAusentismoTipo' in error.errors) {
                        const errors = {};
                        error.errors.tipoAusentismoTipo.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('tipoAusentismoTipo').setErrors(errors);
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

                    if ('horaSalida' in error.errors) {
                        const errors = {};
                        error.errors.horaSalida.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('horaSalida').setErrors(errors);
                    }

                    if ('horaLlegada' in error.errors) {
                        const errors = {};
                        error.errors.horaLlegada.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('horaLlegada').setErrors(errors);
                    }

                    if ('observaciones' in error.errors) {
                        const errors = {};
                        error.errors.observaciones.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('observaciones').setErrors(errors);
                    }

                }
            });
    }

    displayFn(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

    private _tipoAusentismo(tipoAusentismoClase, array: any[]): void {
        this._service.getTipoAusentismos(tipoAusentismoClase).then(
            (response: any[]) => {
                response.forEach(element => {
                    array.push(element);
                });
            }
        );
    }


    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validate(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;

        if (value.horaSalida != null && value.horaLlegada != null) {
            formGroup.get('horaLlegada').setErrors(null);
            // validacion de la hora
            const horaSalidas = moment(moment().format(`YYYY-MM-DD ${value.horaSalida}`)).toDate();
            const horaLlegadas = moment(moment().format(`YYYY-MM-DD ${value.horaLlegada}`)).toDate();
            if (horaLlegadas.getTime() <= horaSalidas.getTime()) {
                const errors = {};
                errors['La hora de llegada no puede ser igual o menor a la hora de salida.'] = true;
                formGroup.get('horaLlegada').setErrors(errors);

            }
        }

        if (value.fechaInicio && value.fechaFin) {
            const fechaInicio = moment(value.fechaInicio).toDate();
            const fechaFin = moment(value.fechaFin).add(1, 'day').toDate();
            formGroup.get('fechaFin').setErrors(null);

            if (fechaInicio.getTime() >= fechaFin.getTime()
            ) {
                const errors = {};
                errors[
                    'La fecha de finalización no puede ser menor que la fecha de inicio.'
                ] = true;
                formGroup.get('fechaFin').setErrors(errors);
            }
        }

        if (value.id == null) {
            if (value.fechaInicio) {
                const fechaInicio = moment(
                    value.fechaInicio
                ).toDate();
                const fechaActual = new Date(
                    new Date().setDate(new Date().getDate() - 1)
                );
                formGroup.get('fechaInicio').setErrors(null);
                if (fechaInicio.getTime() < fechaActual.getTime()) {
                    const errors = {};
                    errors[
                        'La fecha de inicio no puede ser menor que la fecha actual.'
                    ] = true;
                    formGroup.get('fechaInicio').setErrors(errors);
                }
            }
        }


        return null;
    }

}
