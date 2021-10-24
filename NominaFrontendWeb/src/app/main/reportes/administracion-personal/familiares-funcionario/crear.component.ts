import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearFamiliaresFuncionarioService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';

import { AlcanosValidators } from '@alcanos/utils';

// chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, switchMap } from 'rxjs/operators';
import { reporteEstadoRegistraduria } from '@alcanos/constantes/reportes-estados';
import * as moment from 'moment';


@Component({
    selector: 'familiares-funcionario-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CrearFamiliaresFuncionarioComponent implements OnInit {
    form: FormGroup;
    submit: boolean;
    getCentroOperativoOptions: any[] = [];
    getDependenciaOptions: any[] = [];
    getParentescosOptions: any[] = [];
    espera: boolean = false;

    registraduriaConstant = reporteEstadoRegistraduria;

    // Chips
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCargos: Observable<string[]>;
    cargos: any = [];
    todosCargos: any = [] = [];
    disableChip: boolean = true;

    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<string[]>;

    @ViewChild('CargoInput', { static: true }) CargoInput: ElementRef;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: CrearFamiliaresFuncionarioService
    ) {
        this.form = this._formBuilder.group({
            tipoParentescoId: [null, []],
            funcionario: [null, []],
            CentroOperativoId: [null, []],
            DependenciaId: [null, []],
            cargoId: [null, []],
        });
        this.submit = false;

        this._service.getCargo().then(resp => {
            this.todosCargos = resp;
        });

        this.filteredCargos = this.form.get('cargoId').valueChanges.pipe(
            startWith(null),
            map((cargo: string | null) => cargo ? this._filter(cargo) : this.todosCargos.slice()));
    }

    ngOnInit(): void {

        this._service.getCentroOperativos().then(resp => {
            this.getCentroOperativoOptions = resp;
        });

        this._service.getDependencias().then(resp => {
            this.getDependenciaOptions = resp;
        });


        this._service.getParentescos().then(resp => {
            this.getParentescosOptions = resp;
        });

        // this.form.get('DependenciaId').valueChanges.subscribe(
        //     (value) => {
        //         if (value.length > 0) {
        //             this.disableChip = false;
        //         } else {
        //             this.disableChip = true;
        //             this.cargos = null;
        //         }
        //     }
        // );

        this.filteredFuncionarios = this.form
            .get('funcionario').valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );
    }

    focusData(event): void {
        if (this.form.value.funcionario && this.form.value.funcionario.id) {
            // CA 01 - 02 HU061 V1
            this._service
                .getDatosActuales(this.form.value.funcionario.id)
                .then(resp => {
                    const errors = {};
                    let vig = false;
                    let activo = false;
                    if (resp.contrato.estado !== 'Vigente') {
                        errors[
                            'El funcionario que intentas ingresar no cuenta con un contrato vigente, por favor revisa.'
                        ] = true;
                        this.form.get('funcionario').setErrors(errors);
                        vig = true;
                    }
                });
        }
    }


    get cargoId(): AbstractControl {
        return this.form.get('cargoId');
    }

    get CentroOperativoId(): AbstractControl {
        return this.form.get('CentroOperativoId');
    }

    get DependenciaId(): AbstractControl {
        return this.form.get('DependenciaId');
    }

    get tipoParentescoId(): AbstractControl {
        return this.form.get('tipoParentescoId');
    }

    get funcionario(): AbstractControl {
        return this.form.get('funcionario');
    }

    // Estructura del objeto desde la documentación no la elimino para que se tome como referencia a una adición desde el filtro general
    // Tener en cuenta que en el html se encuentra igualmente elimnado los objetos que interactuan con esta funcion
    // start chips -> Angular doc https://material.angular.io/components/chips/overview
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add our cargo
        // if ((value || '').trim()) {
        //     this.cargos.push({
        //         id: Math.random(),
        //         nombre: value.trim()
        //     });
        // }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.form.get('cargoId').setValue(null);
    }

    remove(cargo, indx): void {
        this.cargos.splice(indx, 1);
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.cargos.push(event.option.value);
        this.CargoInput.nativeElement.value = '';
        this.form.get('cargoId').setValue(null);
    }

    private _filter(value: any): any {
        // se incluye el filtro como servicio
        this._service.getSoloCargo(value).then(resp => {
            this.todosCargos = resp;
        });
        return this.todosCargos;
    }

    // end chips



    guardarHandle(event): void {
        const formValue = this.form.value;
        this.submit = false;
        const array = [];

        if (formValue.CentroOperativoId != null) {
            if (typeof formValue.CentroOperativoId != 'string') {
                if (formValue.CentroOperativoId == "") {
                    formValue.CentroOperativoId = null;
                } else {
                    formValue.CentroOperativoId = formValue.CentroOperativoId.join(',');
                }
            }
        }

        if (formValue.DependenciaId != null) {
            if (typeof formValue.DependenciaId != 'string') {
                if (formValue.DependenciaId == "") {
                    formValue.DependenciaId = null;
                } else {
                    formValue.DependenciaId = formValue.DependenciaId.join(',');
                }
            }
        }

        if (formValue.tipoParentescoId != null) {
            if (typeof formValue.tipoParentescoId != 'string') {
                if (formValue.tipoParentescoId == "") {
                    formValue.tipoParentescoId = null;
                } else {
                    formValue.tipoParentescoId = formValue.tipoParentescoId.join(',');
                }
            }
        }

        if (this.cargos != null) {
            this.cargos.forEach(element => {
                array.push(element.id);
            });
            formValue.cargoId = array.join(',');
        }

        if (formValue.cargoId === '') {
            formValue.cargoId = null;
        }

        this.espera = true;
        this.submit = true;

        if (formValue.funcionario != null) {
            formValue.FuncionarioId = formValue.funcionario.id;
        }

        this._service.crear(formValue)
            .then((resp) => {
                this.espera = false;
                this.submit = false;

                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                window.open(resp.url + resp.file, "_blank");
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
                    if ('tipoParentescoId' in error) {
                        const errores = {};
                        error.tipoParentescoId.forEach(element => {
                            errores[element] = true;
                        });
                        this.tipoParentescoId.setErrors(errores);
                    }

                    if ('funcionario' in error) {
                        const errores = {};
                        error.funcionario.forEach(element => {
                            errores[element] = true;
                        });
                        this.funcionario.setErrors(errores);
                    }

                    if ('CentroOperativoId' in error) {
                        const errores = {};
                        error.CentroOperativoId.forEach(element => {
                            errores[element] = true;
                        });
                        this.CentroOperativoId.setErrors(errores);
                    }

                    if ('DependenciaId' in error) {
                        const errores = {};
                        error.DependenciaId.forEach(element => {
                            errores[element] = true;
                        });
                        this.DependenciaId.setErrors(errores);
                    }

                    if ('cargoId' in error) {
                        const errores = {};
                        error.cargoId.forEach(element => {
                            errores[element] = true;
                        });
                        this.cargoId.setErrors(errores);
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

    displayFn(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

}
