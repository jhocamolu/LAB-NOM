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

    form: FormGroup;
    submit: boolean;
    item: any;

    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<any>;

    id: number;
    administradoras: any[];
    tipoAdministradoras: any[];
    actualAdministradora: any;
    actual: string;
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
        private _matDialog: MatDialog,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: FormularioService,
        private _permisos: PermisosrService
    ) {
        this.actual = 'N/A';
        //        this.arrayPermisosSoporte = this._permisos.permisosStorage('SoporteSolicitudPermiso_');
        this.id = null;
        this.submit = false;
        this.form = this._formBuilder.group({
            id: [null, []],
            funcionario: [null, [Validators.required]],
            tipoAdministradoraId: [null, [Validators.required]],
            fechaInicio: [null, [Validators.required]],
            nueva: [null, [Validators.required]],
            observacion: [null, [AlcanosValidators.maxLength(500)]],
        }, { validators: this.validate });


    }

    ngOnInit(): void {

        this._service.onItemChanged.subscribe(
            (response: any) => {
                this.item = response;

                this.administradoras = [];
                if (response != null) {
                    this.id = this.item.id;
                    this.form.get('nueva').disable();
                    this.getAdministradorasTipo(this.item.funcionario.id);
                    this.form.patchValue({
                        id: this.item.id,
                        funcionario: this.item.funcionario,
                        tipoAdministradoraId: this.item.tipoAdministradora.id,
                        fechaInicio: this.item.fechaInicio,
                        observacion: this.item.observacion
                    });
                    const el = setInterval(() => {
                        if (typeof this.actualAdministradora == 'object') {
                            this.actualAdministradora.map(element => {
                                if (element.administradora.tipoAdministradora.id === this.item.tipoAdministradora.id) {
                                    this.actual = `${element.administradora.nombre}`;
                                    this.actualId = `${element.administradora.id}`;
                                }
                            });
                        }
                    }, 300);
                    setTimeout(() => {
                        clearInterval(el);
                        this.administradoras = [];
                        this.tipoAdministradoras.map(element => {
                            if (element.id == this.form.get('tipoAdministradoraId').value) {
                                this._service.getAdministradoraCodigos(element.codigo).then(resp => {
                                    this.administradoras = resp;
                                });
                            }
                        });

                        this.form.get('nueva').enable();
                        this.form.patchValue({
                            nueva: Number(this.actualId)
                        });
                    }, 4500);



                    this.form.get('funcionario').disable();
                    this.form.get('tipoAdministradoraId').disable();
                } else {
                    this._service.getAdministradoras().then(resp => {
                        this.administradoras = resp;
                    });
                }
            }
        );

        this.filteredFuncionarios = this.form.get('funcionario').valueChanges.pipe(
            debounceTime(300),
            switchMap(value => this.getContratoAdministradorasFuncionarios(value))
        );

        this.form.get('tipoAdministradoraId').valueChanges.subscribe(value => {
            if (typeof this.actualAdministradora == 'object') {
                this.actualAdministradora.map(element => {
                    if (element.administradora.tipoAdministradora.id === value) {
                        this.actual = `${element.administradora.nombre}`;
                    }
                });
                this.tipoAdministradoras.map(element => {
                    if (element.id == this.form.get('tipoAdministradoraId').value) {
                        this._service.getAdministradoraCodigos(element.codigo).then(resp => {
                            this.administradoras = resp;
                        });
                    }
                });
            }
        });

    }

    getContratoAdministradorasFuncionarios(value: any): any {
        if (typeof value === 'object') {
            this.getAdministradorasTipo(value.id);
        }
        return this._service.getFuncionarios(value);
    }

    getAdministradorasTipo(funcionarioId: number): any {
        const administradora = [];
        this._service.getAdministradoraSolo(funcionarioId).then(resp => {
            this.actualAdministradora = resp;
            resp.map(element => {
                administradora.push({
                    id: element.administradora.tipoAdministradora.id,
                    codigo: element.administradora.tipoAdministradora.codigo,
                    nombre: element.administradora.tipoAdministradora.nombre,
                });
            });
            this.tipoAdministradoras = administradora.sort(this.dinamicoSort('nombre'));
        });
    }

    // Como se mencionó, esta función debe inyectarse como primer argumento a la función de clasificación de prototipo de una matriz en JavaScript, por lo que no la usará directamente, 
    // ya que solo devolverá 0 o 1. El punto principal de esta función para ordenar es el localeCompare, una función de JavaScript incluida en el prototipo de cadenas que devuelve 
    // un número que indica si la cadena1 viene antes, después o es la misma que cadena2 en el orden de clasificación (valores). Recuperado y actualizado a ECMASCRIPT 2015 de:  https://ourcodeworld.com/articles/read/764/how-to-sort-alphabetically-an-array-of-objects-by-key-in-javascript

    dinamicoSort(property): any {
        let sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return (a, b) => {
            if (sortOrder == -1) {
                return b[property].localeCompare(a[property]);
            } else {
                return a[property].localeCompare(b[property]);
            }
        };
    }

    ngAfterViewInit(): void { }

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

        if (formValue.funcionario != null) {
            formValue.funcionarioId = formValue.funcionario.id;
        }

        if (this.item != null) {
            formValue.funcionarioId = this.item.funcionario.id;
            formValue.tipoAdministradoraId = this.item.tipoAdministradora.id;
        }
        if (formValue.observacion == undefined) {
            formValue.observacion = null;
        }
        if (formValue.nueva != null) {
            formValue.administradoraId = formValue.nueva;
        }

        if (this.id) {
            formValue.id = this.id;
        }

        formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DD');

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                // this.segundo();
                this.submit = false;
                //this._router.navigate([`/administracion-personal/cambio-administradora/${resp.id}/editar`], { queryParams: { tab: 1 } });
                this._router.navigate([`/administracion-personal/cambio-administradora`]);

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

                    if ('funcionarioId' in error.errors) {
                        const errors = {};
                        error.errors.funcionarioId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('funcionarios').setErrors(errors);
                    }

                    if ('tipoAdministradoraId' in error.errors) {
                        const errors = {};
                        error.errors.tipoAdministradoraId.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('tipoAdministradoraId').setErrors(errors);
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



    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validate(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;

        // if (value.id == null) {
        //     if (value.fechaInicio) {
        //         const fechaInicio = moment(
        //             value.fechaInicio
        //         ).toDate();
        //         const fechaActual = new Date(
        //             new Date().setDate(new Date().getDate() - 1)
        //         );
        //         formGroup.get('fechaInicio').setErrors(null);
        //         if (fechaInicio.getTime() < fechaActual.getTime()) {
        //             const errors = {};
        //             errors[
        //                 'La fecha de inicio no puede ser menor que la fecha actual.'
        //             ] = true;
        //             formGroup.get('fechaInicio').setErrors(errors);
        //         }
        //     }
        // }
        return null;
    }

}
