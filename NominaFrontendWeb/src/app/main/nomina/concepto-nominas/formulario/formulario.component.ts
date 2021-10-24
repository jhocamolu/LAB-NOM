import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTabChangeEvent, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { startWith, map } from 'rxjs/operators';
import { AlcanosValidators } from '@alcanos/utils';
import { FormularioService } from './formulario.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import * as moment from 'moment';
import { CuentasListarComponent } from '../cuentas/listar/listar.component';
import { UnidadMedidaAlcanos, OrigenCentroCostoAlcanos, OrigenTerceroAlcanos } from '@alcanos/constantes/clase-concepto-nomina';


// chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'concepto-nomina-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FormularioComponent implements OnInit {

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
    orden: number = null;

    unidadMedida = UnidadMedidaAlcanos;
    origenCentroCosto = OrigenCentroCostoAlcanos;
    origenTercero = OrigenTerceroAlcanos;


    // Chips
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredConceptoAsociado: Observable<string[]>;
    conceptosAsociados: any[] = [];
    tipoAdministradoras: any[] = [];
    todosConceptosAsociados: any = [] = [];
    disableChip: boolean = true;

    @ViewChild('ConceptosAsociados', { static: true }) ConceptosAsociados: ElementRef;

    @ViewChild(CuentasListarComponent, { static: false })
    tablaListaCuentas: CuentasListarComponent;

    // Permisos
    arrayPermisos: any;
    arrayPermisosCuentaContable: any;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioService,
        private _router: Router,
        private _matDialog: MatDialog,
        private _permisos: PermisosrService
    ) {
        this.id = this._service.id;
        this.form = this._formBuilder.group({
            id: [null],
            codigo: [null, [Validators.required, AlcanosValidators.maxLength(12), AlcanosValidators.alfanumerico]],
            alias: [null, [Validators.required, AlcanosValidators.maxLength(255), AlcanosValidators.alfanumerico]],
            nombre: [null, [Validators.required, AlcanosValidators.maxLength(255), AlcanosValidators.alfanumerico]],
            tipoConceptoNomina: [null, [Validators.required]],
            claseConceptoNomina: [null, [Validators.required]],
            // orden: [null, [Validators.required, Validators.max(500), AlcanosValidators.numerico]],
            origenTercero: [null, [Validators.required]],
            origenCentroCosto: [null, [Validators.required]],
            visibleImpresion: [null, [Validators.required]],
            conceptoAgrupador: [null, [Validators.required]],
            TipoAdministradoraId: [null, []],
            conceptosAsociados: [null, []],
            unidadMedida: [null, [Validators.required]],
            requiereCantidad: [null, [Validators.required]],
            funcionNominaId: [null, []],
            nitTercero: [null, [Validators.required, AlcanosValidators.numerico, Validators.max(9999999999)]],
            digitoVerificacion: [null, [AlcanosValidators.numerico, Validators.max(9)]],
            descripcion: [null, [Validators.required]],
        }, { validator: this.validateConceptoNominas });
        this.submit = false;
        this.selectedTab = this._service.tab;

        this._service.getTipoAdministradoras().then(resp => {
            this.tipoAdministradoras = resp;
        });

        this._service.onClaseConceptonominaChanged.subscribe((resp) => {
            this.claseConceptosOptions = resp;
        });

        this._service.onTipoConceptoNominaChanged.subscribe((resp) => {
            this.tipoConceptosOptions = resp;
        });

        this._service._getFuncionNominas().then((resp) => {
            this.funcionNominasOptions = resp;
        });

        this.arrayPermisos = this._permisos.permisosStorage('ConceptoNominas_');
        this.arrayPermisosCuentaContable = this._permisos.permisosStorage('ConceptoNominaCuentaContables_');
    }

    ngOnInit(): void {

        if (this.arrayPermisos.actualizar != true) {
            this.selectedTab = 1;
        }

        this._service.onItemChanged.subscribe(data => {
            if (data) {
                this.item = data;

                this._service.getTipoAdministradorasSolo(data.id).then(resp => {
                    let tipoAdministradora = null;
                    if (resp != undefined) {
                        resp.forEach(element => {
                            tipoAdministradora = element.tipoAdministradoraId;
                        });
                    }
                    if (tipoAdministradora == null) {
                        this.form.patchValue({
                            TipoAdministradoraId: 'NoAplica',
                        });
                    } else {
                        this.form.patchValue({
                            TipoAdministradoraId: tipoAdministradora,
                        });
                    }

                });

                this.form.patchValue({
                    id: data.id,
                    codigo: data.codigo,
                    alias: data.alias,
                    nombre: data.nombre,
                    tipoConceptoNomina: data.tipoConceptoNomina,
                    claseConceptoNomina: data.claseConceptoNomina,
                    origenTercero: data.origenTercero,
                    origenCentroCosto: data.origenCentroCosto,
                    visibleImpresion: data.visibleImpresion,
                    TipoAdministradoraId: this.item.TipoAdministradoraId,
                    conceptoAgrupador: data.conceptoAgrupador,
                    unidadMedida: data.unidadMedida,
                    requiereCantidad: data.requiereCantidad,
                    funcionNominaId: data.funcionNominaId,
                    nitTercero: data.nitTercero,
                    digitoVerificacion: data.digitoVerificacion,
                    descripcion: data.descripcion,
                });

                this.orden = data.orden;
                localStorage.setItem('orden', data.orden);

                // se preconvierte el agrupador mas el data para obtener el servicio este esta acondicionado para ser recibido en chip mas los conceptos asociados
                this._service.getItemAsociadas(data.conceptoAgrupador, data.id)
                    .then(resp => {
                        this.conceptosAsociados = resp;
                    });


                this.changeRequiereCantidad();
                this.changeOrigenTercero();
                this.form.markAllAsTouched();
            }
        });

        this.form.get('origenTercero').valueChanges.subscribe(
            (value) => {
                this.changeOrigenTercero();
            }
        );

        this.form.get('requiereCantidad').valueChanges.subscribe(
            (value) => {
                this.changeRequiereCantidad();
            }
        );

        this.filteredConceptoAsociado = this.form.get('conceptosAsociados').valueChanges.pipe(
            startWith(null),
            map((conceptoAsociado: string | null) => conceptoAsociado ? this._filter(conceptoAsociado) : this.todosConceptosAsociados.slice()));
    }

    changeRequiereCantidad(): void {
        const value = this.form.get('requiereCantidad').value;
        if (value === true) {
            this.form.get('funcionNominaId').setValidators([Validators.required]);
            this.form.get('funcionNominaId').enable();
        } else {
            this.form.get('funcionNominaId').disable();
        }
    }

    changeOrigenTercero(): void {
        const value = this.form.get('origenTercero').value;
        if (value === 'Especifico') {
            this.desabilitar = false;
            this.form.get('nitTercero').setValidators([Validators.required, AlcanosValidators.numerico, Validators.max(9999999999)]);
            this.form.get('digitoVerificacion').setValidators([Validators.required, AlcanosValidators.numerico, Validators.max(9)]);
            this.form.get('nitTercero').enable();
            this.form.get('digitoVerificacion').enable();
        } else {
            this.form.get('nitTercero').disable();
            this.form.get('digitoVerificacion').disable();
            this.desabilitar = true;
        }
    }

    cuentaHandle(event): void {
        this.selectedTab = 1;
        this.tablaListaCuentas.cuentaHandle(event);
    }

    ordenarHandle(event): void {
        this.selectedTab = 1;
        this.tablaListaCuentas.ordenarHandle(event);
    }

    changeTab(): void {
        this.selectedTab += 1;
        if (this.selectedTab >= 2) {
            this.selectedTab = 0;
        }
    }


    // Estructura del objeto desde la documentación no la elimino para que se tome como referencia a una adición desde el filtro general
    // Tener en cuenta que en el html se encuentra igualmente elimnado los objetos que interactuan con esta funcion
    // start chips -> Angular doc https://material.angular.io/components/chips/overview
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add our conceptoAsociado

        // if ((value || '').trim()) {
        //     this.conceptosAsociados.push({
        //         id: Math.random(),
        //         nombre: value.trim()
        //     });
        // }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.form.get('conceptosAsociados').setValue(null);
    }

    remove(conceptoAsociado, indx): void {
        this.conceptosAsociados.splice(indx, 1);
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.conceptosAsociados.push(event.option.value);
        this.ConceptosAsociados.nativeElement.value = '';
        this.form.get('conceptosAsociados').setValue(null);
    }

    private _filter(value: any): any {
        const concepAgrupa = this.form.get('conceptoAgrupador').value;
        const ordena = this.orden;

        // console.log(ordena, concepAgrupa);
        // se incluye el filtro como servicio
        this._service.getConceptoAsociado(value, concepAgrupa, ordena).then(resp => {
            this.todosConceptosAsociados = resp;
        });
        return this.todosConceptosAsociados;
    }

    // end chips


    tabChangeHandle(event: MatTabChangeEvent): void {
        this.selectedTab = event.index;
    }

    guardarHandle(event): void {
        const array = [];
        const formValue = this.form.value;
        formValue.bases = null;
        formValue.agrupadores = null;

        if (formValue.TipoAdministradoraId == 'NoAplica') {
            formValue.TipoAdministradoraId = null;
        }

        if (this.conceptosAsociados != null) {
            this.conceptosAsociados.forEach(element => {
                array.push(element.id);
            });
        }

        if (formValue.conceptoAgrupador) {
            formValue.bases = array;
        } else {
            formValue.agrupadores = array;
        }

        this.submit = true;

        this._service.upsert(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this.submit = false;
                this._router.routeReuseStrategy.shouldReuseRoute = () => false;
                this._router.onSameUrlNavigation = 'reload';
                this._router.navigate([`/nomina/concepto-nominas/${resp.id}/editar`], {
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

                    if ('alias' in error.errors) {
                        const errores = {};
                        error.errors.alias.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('alias').setErrors(errores);
                    }

                    if ('nombre' in error.errors) {
                        const errores = {};
                        error.errors.nombre.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('nombre').setErrors(errores);
                    }

                    if ('tipoConceptoNomina' in error.errors) {
                        const errores = {};
                        error.errors.tipoConceptoNomina.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('tipoConceptoNomina').setErrors(errores);
                    }

                    if ('claseConceptoNomina' in error.errors) {
                        const errores = {};
                        error.errors.claseConceptoNomina.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('claseConceptoNomina').setErrors(errores);
                    }

                    if ('orden' in error.errors) {
                        const errores = {};
                        error.errors.orden.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('orden').setErrors(errores);
                    }

                    if ('origenTercero' in error.errors) {
                        const errores = {};
                        error.errors.origenTercero.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('origenTercero').setErrors(errores);
                    }

                    if ('origenCentroCosto' in error.errors) {
                        const errores = {};
                        error.errors.origenCentroCosto.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('origenCentroCosto').setErrors(errores);
                    }

                    if ('visibleImpresion' in error.errors) {
                        const errores = {};
                        error.errors.visibleImpresion.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('visibleImpresion').setErrors(errores);
                    }

                    if ('unidadMedida' in error.errors) {
                        const errores = {};
                        error.errors.unidadMedida.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('unidadMedida').setErrors(errores);
                    }

                    if ('requiereCantidad' in error.errors) {
                        const errores = {};
                        error.errors.requiereCantidad.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('requiereCantidad').setErrors(errores);
                    }

                    if ('funcionNominaId' in error.errors) {
                        const errores = {};
                        error.errors.funcionNominaId.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('funcionNominaId').setErrors(errores);
                    }

                    if ('nitTercero' in error.errors) {
                        const errores = {};
                        error.errors.nitTercero.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('nitTercero').setErrors(errores);
                    }

                    if ('digitoVerificacion' in error.errors) {
                        const errores = {};
                        error.errors.digitoVerificacion.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('digitoVerificacion').setErrors(errores);
                    }

                    if ('descripcion' in error.errors) {
                        const errores = {};
                        error.errors.descripcion.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('descripcion').setErrors(errores);
                    }


                    if ('conceptoAgrupador' in error.errors) {
                        const errores = {};
                        error.errors.conceptoAgrupador.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('conceptoAgrupador').setErrors(errores);
                    }


                    if ('bases' in error.errors) {
                        const errores = {};
                        error.errors.bases.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('conceptosAsociados').setErrors(errores);
                    }

                    if ('agrupadores' in error.errors) {
                        const errores = {};
                        error.errors.agrupadores.forEach(element => {
                            errores[element] = true;
                        });
                        this.form.get('conceptosAsociados').setErrors(errores);
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

    /**
     * 
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validateConceptoNominas(formGroup: FormGroup): any { // ValidatorFn error
        const value = formGroup.value;

        if (value.nitTercero != null && value.digitoVerificacion != null) {

            let vpri, x, y, z;

            // Procedimiento
            vpri = new Array(16);
            z = `${value.nitTercero}`.length;

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
                y = (`${value.nitTercero}`.substr(i, 1));
                x += (y * vpri[z - i]);
            }
            y = x % 11;
            const dv = (y > 1) ? 11 - y : y;
            if (!(!isNaN(dv) && dv == value.digitoVerificacion)) {
                const errors = Object.assign({}, formGroup.get('digitoVerificacion').errors);
                errors[`El DV es incorrecto, por favor verifica.`] = true;
                formGroup.get('digitoVerificacion').setErrors(errors);

            }
            if ((!isNaN(dv) && dv == value.digitoVerificacion)) {
                formGroup.get('digitoVerificacion').setErrors(null);
            }
        }
        return null;
    }

}
