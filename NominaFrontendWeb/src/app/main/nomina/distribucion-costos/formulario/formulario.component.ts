import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatTabChangeEvent } from '@angular/material';
import { Route, Router } from '@angular/router';
import { Observable, merge } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosValidators } from '@alcanos/utils';
import { FormularioService } from './formulario.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import * as moment from 'moment';
import { ConceptosListarComponent } from '../conceptos/listar/listar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'concepto-nomina-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FormularioComponent implements OnInit {
    
    // Permisos
    arrayPermisosCostos: any;

    id: any;
    item: any;
    itemAsociados: any[] = [];

    form: FormGroup;
    submit: boolean;
    tipoConceptosOptions: any[] = [];
    claseConceptosOptions: any[] = [];
    funcionNominasOptions: any[] = [];
    desabilitar: boolean;
    selectedTab: number;

    conceptosAsociados: any[] = [];


    @ViewChild(ConceptosListarComponent, { static: false })
    tablaListaCuentas: ConceptosListarComponent;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioService,
        private _router: Router,
        private _permisos: PermisosrService,
    ) {
        this.id = this._service.id;
        this.form = this._formBuilder.group({
            id: [null],
            codigo: [null, [Validators.required, AlcanosValidators.maxLength(10), AlcanosValidators.alfanumerico]],
            promedioProductividad: [null, [Validators.required, Validators.max(1000), AlcanosValidators.numerico]],
            nombre: [null, [Validators.required, AlcanosValidators.maxLength(255), AlcanosValidators.alfanumerico]],
            descripcion: [null, [AlcanosValidators.maxLength(500)]],
        });
        this.submit = false;
        this.selectedTab = this._service.tab;
        this.arrayPermisosCostos = this._permisos.permisosStorage('ActividadCentroCostos_');
    }

    ngOnInit(): void {
        this._service.onItemChanged.subscribe(data => {
            if (data) {
                this.item = data;
                this.form.patchValue({
                    id: data.id,
                    codigo: data.codigo,
                    promedioProductividad: data.promedioProductividad,
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                });

                this.form.markAllAsTouched();
            }
        });
    }

    cuentaHandle(event): void {
        this.selectedTab = 1;
        this.tablaListaCuentas.cuentaHandle(event);
    }


    changeTab(): void {
        this.selectedTab += 1;
        if (this.selectedTab >= 2) {
            this.selectedTab = 0;
        }
    }

    tabChangeHandle(event: MatTabChangeEvent): void {
        this.selectedTab = event.index;
    }

    guardarHandle(event): void {
        const formValue = this.form.value;
        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this.submit = false;
                this._router.routeReuseStrategy.shouldReuseRoute = () => false;
                this._router.onSameUrlNavigation = 'reload';
                this._router.navigate([`/nomina/distribucion-costos/${resp.id}/editar`], {
                    queryParams: {
                        tab: 1,
                        updated: moment(),
                    }
                });
            }
            ).catch((resp: HttpErrorResponse) => {
                this._alcanosSnackBar.snackbar({
                    clase: 'error',
                    mensaje: resp.status === 400 ? 'Se ha presentado un error al procesar el formulario.' : null,
                });
                this.submit = false;
                let error = resp.error;
                if (typeof resp.error === 'string') {
                    error = JSON.parse(resp.error);
                }

                if (resp.status === 400 && 'errors' in error) {

                    if ('codigo' in error.errors) {
                        const errores = {};
                        error.errors.codigo.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('codigo').setErrors(errores);
                    }

                    if ('promedioProductividad' in error.errors) {
                        const errores = {};
                        error.errors.promedioProductividad.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('promedioProductividad').setErrors(errores);
                    }

                    if ('nombre' in error.errors) {
                        const errores = {};
                        error.errors.nombre.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('nombre').setErrors(errores);
                    }

                    if ('descripcion' in error.errors) {
                        const errores = {};
                        error.errors.descripcion.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('descripcion').setErrors(errores);
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

                }
            });
    }

    displayFn(element: any): string {
        return element ? element.nombre : element;
    }

}
