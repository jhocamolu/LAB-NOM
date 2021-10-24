import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';

import * as moment from 'moment';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
    selector: 'formulario-novedades',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    submit: boolean;
    item: any;

    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<any>;

    id: number;
    centroTrabajos: any[];
    actual: string;
    anterior: string;

    actualId: any;
    /**
     * 
     * @param _formBuilder 
     * @param _matDialog 
     * @param _router 
     * @param _service 
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: FormularioService,
    ) {
        this.actual = 'N/A';
        this.id = null;
        this.submit = false;
        this.form = this._formBuilder.group({
            id: [null, []],
            contratoId: [null, []],
            funcionario: [null, [Validators.required]],
            centroTrabajoId: [null, [Validators.required]],
            fechaInicio: [null, [Validators.required]],
            observacion: [null, [AlcanosValidators.maxLength(500)]],
        });


    }

    ngOnInit(): void {
        this._service.getCentroTrabajos().then(resp => {
            this.centroTrabajos = resp;
        });
        this._service.onItemChanged.subscribe(
            (response: any) => {
                this.item = response;
                if (response != null) {
                    this.anterior = this.item.anterior;
                    this.id = this.item.id;
                    this.form.patchValue({
                        id: this.item.id,
                        contratoId: this.item.contratoId,
                        funcionario: this.item.funcionario,
                        centroTrabajoId: this.item.centroTrabajoActualId,
                        fechaInicio: this.item.fechaInicio,
                        observacion: this.item.observacion
                    });

                    this.form.get('funcionario').disable();
                }
            }
        );

        this.filteredFuncionarios = this.form.get('funcionario').valueChanges.pipe(
            debounceTime(300),
            switchMap(value => this.getContratoAdministradorasFuncionarios(value))
        );
    }


    getContratoAdministradorasFuncionarios(value: any): any {
        if (typeof value === 'object') {
            this._service.getCentroTrabajoSolo(value).then(resp => {
                resp.forEach(element => {
                    this.form.patchValue({
                        contratoId: element.contratoId
                    });
                    this.actual = element.centroTrabajo.nombre;
                });
            });
        }
        return this._service.getFuncionarios(value);
    }



    ngAfterViewInit(): void { }

    focusData(event): void {
        if (this.form.value.funcionario && this.form.value.funcionario.id) {
            this._service
                .getDatosActuales(this.form.value.funcionario.id)
                .then(resp => {
                    const errors = {};
                    if (resp.contrato != null) {
                        
                        if (resp.contrato.estado !== 'Vigente' || resp.contrato.funcionario.estado !== 'Activo') {
                            errors['El funcionario que intentas ingresar no se encuentra activo, o no tiene contrato vigente, por favor revisa.'] = true;
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

        if (formValue.funcionario != null) {
            formValue.funcionarioId = formValue.funcionario.id;
        }

        if (this.item != null) {
            formValue.funcionarioId = this.item.funcionario.id;
        }

        if (formValue.observacion == undefined) {
            formValue.observacion = null;
        }

        if (this.id) {
            formValue.id = this.id;
        }

        formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DD');

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this.submit = false;
                this._router.navigate([`/administracion-personal/cambio-centro-trabajos`]);
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

                    if ('snackError' in error.errors) {
                        const errors = {};
                        error.errors.snackError.forEach(element => {
                            this._alcanosSnackBar.snackbar({
                                clase: 'error',
                                mensaje: element,
                                time: 6000
                            });
                        });
                    }

                    if ('funcionarioId' in error.errors) {
                        const errors = {};
                        error.errors.funcionarioId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionario').setErrors(errors);
                    }

                    if ('centroTrabajoId' in error.errors) {
                        const errors = {};
                        error.errors.centroTrabajoId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('centroTrabajoId').setErrors(errors);
                    }

                    if ('fechaInicio' in error.errors) {
                        const errors = {};
                        error.errors.fechaInicio.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('fechaInicio').setErrors(errors);
                    }

                    if ('administradoraId' in error.errors) {
                        const errors = {};
                        error.errors.administradoraId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('nueva').setErrors(errors);
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

    displayFn(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

}
