import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ManualActividadService } from './manual.service';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';
import * as moment from 'moment';

// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
    selector: 'manual-costos',
    templateUrl: './manual.component.html',
    styleUrls: ['./manual.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ManualActividadComponent implements OnInit, OnDestroy {

    form: FormGroup;
    submit: boolean;
    estadoSolicitud = estadoBeneficiosAlcanos;
    espera: boolean;
    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<any>;
    filteredCargos: Observable<any>;
    centroOperativos: any[] = [];
    boleanFuncionario: boolean;
    boleanCargo: boolean;

    constructor(
        public dialogRef: MatDialogRef<ManualActividadComponent>,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: ManualActividadService
    ) {
        this.espera = false;
        this.form = this._formBuilder.group({
            agregar: [null, [Validators.required]],
            fechaInicioVigencia: [null, [Validators.required]],
            funcionarioId: [null, []],
            cargo: [null, []],
            centroOperativo: [null, []],
        });

        this.boleanFuncionario = false;
        this.boleanCargo = false;

    }

    ngOnInit(): void {
        this.filteredFuncionarios = this.form.get('funcionarioId').valueChanges.pipe(
            debounceTime(300),
            switchMap(value => this._service.getFuncionarios(value))
        );

        this.form.get('funcionarioId').valueChanges.subscribe(element => {
            if (typeof element === 'object') {
                this.form.get('funcionarioId').setErrors(null);
            } else {
                this.form.get('funcionarioId').setErrors({ 'Debe seleccionar un funcionario': true });
                this.form.get('funcionarioId').markAllAsTouched();
            }
        });


        this.form.get('fechaInicioVigencia').valueChanges.subscribe(element => {

            if (element != null) {


                let funcionario = null;
                let cargo = null;
                this._service.getFechaCorteFuncionarios().then(value => {
                    if (value != null) {
                        funcionario = value.fechaCorte;
                        let fechaCorteFuncionario = moment(funcionario).toDate();

                        if (element.toDate().getTime() < fechaCorteFuncionario.getTime()) {
                            this.form.get('fechaInicioVigencia').setErrors({ 'La fecha de inicio de vigencia que ingresaste no puede ser menor que la última fecha de vigencia registrada.': true });
                            this.form.get('fechaInicioVigencia').markAllAsTouched();
                        }
                    }
                });
                this._service.getFechaCorteCargos().then(value => {
                    if (value != null) {
                        cargo = value.fechaCorte;
                        let fechaCorteCargo = moment(cargo).toDate();

                        if (element.toDate().getTime() < fechaCorteCargo.getTime()) {
                            this.form.get('fechaInicioVigencia').setErrors({ 'La fecha de inicio de vigencia que ingresaste no puede ser menor que la última fecha de vigencia registrada.': true });
                            this.form.get('fechaInicioVigencia').markAllAsTouched();
                        }
                    }
                });
            }
        });

        this.filteredCargos = this.form.get('cargo').valueChanges.pipe(
            debounceTime(300),
            switchMap(value => this._service.getCargos(value))
        );

        this.form.get('agregar').valueChanges.subscribe(value => {
            if (value == 'Funcionario') {
                this.form.get('cargo').clearValidators();
                this.form.get('cargo').setErrors(null);
                this.form.get('cargo').setValue(null);
                this.form.get('centroOperativo').clearValidators();
                this.form.get('centroOperativo').setErrors(null);
                this.form.get('centroOperativo').setValue(null);

                this.form.get('funcionarioId').setValidators([Validators.required]);
                this.form.get('fechaInicioVigencia').setValue(null);

                this.boleanFuncionario = true;
                this.boleanCargo = false;
            }

            if (value == 'Cargo') {
                this.form.get('funcionarioId').clearValidators();
                this.form.get('funcionarioId').setErrors(null);
                this.form.get('funcionarioId').setValue(null);

                this.form.get('cargo').setValidators([Validators.required]);
                this.form.get('centroOperativo').setValidators([Validators.required]);
                this.form.get('fechaInicioVigencia').setValue(null);

                this.boleanFuncionario = false;
                this.boleanCargo = true;
            }
        });

        this._service.getCentroOperativos().then((resp) => {
            this.centroOperativos = resp;
        });


    }

    get agregar(): AbstractControl {
        return this.form.get('agregar');
    }

    get fechaInicioVigencia(): AbstractControl {
        return this.form.get('fechaInicioVigencia');
    }

    get funcionarioId(): AbstractControl {
        return this.form.get('funcionarioId');
    }

    get cargo(): AbstractControl {
        return this.form.get('cargo');
    }

    get centroOperativo(): AbstractControl {
        return this.form.get('centroOperativo');
    }


    guardarHandle(event): void {
        this.submit = true;
        this.espera = true;
        const formValue = this.form.value;

        formValue.fechaInicioVigencia = moment(formValue.fechaInicioVigencia).format('YYYY-MM-DD');

        if (formValue.funcionarioId != null || formValue.cargo != null) {
            if (formValue.agregar == 'Funcionario') {
                this.dialogRef.close(true);
                this.espera = false;
                localStorage.setItem('usuario', JSON.stringify({
                    agregar: formValue.agregar,
                    fechaInicioVigencia: formValue.fechaInicioVigencia,
                    funcionarioId: formValue.funcionarioId.id,
                    funcionarioCriterioBusqueda: formValue.funcionarioId.criterioBusqueda
                })); 

                if (typeof formValue.funcionarioId === 'object') {
                    this._router.navigate([`/nomina/proceso-costos/${formValue.funcionarioId.id}/generar-manualmente-funcionario`]);
                }
            }

            if (formValue.agregar == 'Cargo') {
                this.espera = false;
                this.dialogRef.close(true);
                this.dialogRef.beforeClosed();
                if (typeof formValue.cargo === 'object') {
                    this._router.navigate([`/nomina/proceso-costos/${formValue.cargo.id}/generar-manualmente-cargo`], {
                        queryParams: {
                            agregar: formValue.agregar,
                            fechaInicioVigencia: formValue.fechaInicioVigencia,
                            cargoId: formValue.cargo.id,
                            centroOperativoId: formValue.centroOperativo,
                        }
                    });
                }
            }

        } else {
            this.espera = false;
            this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No se puede agregar una distribución manual sin un ID de tipo especifico' });
        }
    }

    ngOnDestroy(): void {

    }


    displayFn(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

    displayFnCargos(element: any): string {
        return element ? element.codigo + ' - ' + element.nombre : element;
    }

}
