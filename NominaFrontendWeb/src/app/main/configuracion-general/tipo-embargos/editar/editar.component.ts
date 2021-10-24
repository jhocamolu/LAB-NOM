import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

import { fuseAnimations } from '@fuse/animations';
import { EmbargarCrearComponent } from '../embargar-crear/embargar-crear.component';
import { EmbargarEditarComponent } from '../embargar-editar/embargar-editar.component';


import { MatTabChangeEvent } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosValidators } from '@alcanos/utils';
import { Router } from '@angular/router';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'tipo-embargos-editar',
    templateUrl: './editar.component.html',
    styleUrls: ['./editar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [fuseAnimations],
})
export class EditarComponent implements OnInit {

    arrayPermisosConceptos: any;

    form: FormGroup;
    submit: boolean;
    nivelCargoOptions: any[] = [];
    conceptoNomina: any[];

    conceptoAEmbargar: any[];
    conceptoCount: any;

    id: number;
    item: any;
    public element: any;

    selectedTab = 0;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: EditarService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _permisos: PermisosrService,
    ) {
        this.form = this._formBuilder.group({
            nombre: [null, [Validators.required, AlcanosValidators.maxLength(100), AlcanosValidators.alfabetico]],
            salarioMinimoEmbargable: [null, [Validators.required]],
            conceptoNominaId: [null, [Validators.required]],
            prioridad: [null, [Validators.required, Validators.max(99), AlcanosValidators.numerico, Validators.min(1)]],
        });
        this.selectedTab = this._service.selectedTab;
        this.submit = false;

        this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoEmbargoConceptoNominas_');
    }

    ngOnInit(): void {
        this.id = this._service.onItemChanged.value.tipoEmbargoId;
        this.conceptoNomina = this._service.onConceptoNomina.value;
        this._service._getTipoEmbargoConceptoNominas(this.id).then(resp => {
            this.conceptoCount = resp['@odata.count'];
            this.conceptoAEmbargar = resp.value;
        });

        this._service.onItemChanged.subscribe(
            (response: any) => {
                this.item = response;
                if (response != null) {

                    this.form.patchValue({
                        nombre: this.item.tipoEmbargo.nombre,
                        salarioMinimoEmbargable: this.item.tipoEmbargo.salarioMinimoEmbargable,
                        conceptoNominaId: this.item.conceptoNominaId,
                        prioridad: this.item.tipoEmbargo.prioridad,
                    });

                }
            });

    }

    activarHandle(event, element): void {
        const estado = `${element.estadoRegistro}`.toLocaleLowerCase();
        const verboInverso = element.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
        const clase = element.estadoRegistro === 'Activo' ? 'error' : 'exito';
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
                clase: clase,
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                const bool = element.estadoRegistro === 'Activo' ? false : true;
                this._service.activo(element.id, bool).then(result => {
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                });
            }
        });
    }

    tabChangeHandle(event: MatTabChangeEvent): void {
        this.selectedTab = event.index;
    }


    crearHandle(event, dato): void {
        const dialogRef = this._matDialog.open(EmbargarCrearComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
            data: dato
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._service._getTipoEmbargoConceptoNominas(this.id).then(resp => {
                    this.conceptoCount = resp['@odata.count'];
                    this.conceptoAEmbargar = resp.value;
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                });
            }
        });
    }

    editarHandle(event, id, dato): void {
        const dialogRef = this._matDialog.open(EmbargarEditarComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
            data: {
                id: id,
                dato: dato,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._service._getTipoEmbargoConceptoNominas(this.id).then(resp => {
                    this.conceptoCount = resp['@odata.count'];
                    this.conceptoAEmbargar = resp.value;
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                });
            }
        });
    }

    borrarHandle(event, id): void {
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
                    this._service._getTipoEmbargoConceptoNominas(this.id).then(resp => {
                        this.conceptoCount = resp['@odata.count'];
                        this.conceptoAEmbargar = resp.value;
                    });
                });
            }
        });
    }

    get salarioMinimoEmbargable(): AbstractControl {
        return this.form.get('salarioMinimoEmbargable');
    }

    get conceptoNominaId(): AbstractControl {
        return this.form.get('conceptoNominaId');
    }

    get nombre(): AbstractControl {
        return this.form.get('nombre');
    }

    get prioridad(): AbstractControl {
        return this.form.get('prioridad');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    guardarHandle(event): void {
        const formValue = this.form.value;
        this.submit = true;
        formValue.id = this.item.tipoEmbargoId;
        // se inyecta en el promise editar el id y el formValue
        this._service.editar(this.item.tipoEmbargoId, formValue)
            .then((resp) => {
                this.submit = false;
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this.selectedTab = 1;
                this._service.getConceptoNominaIntent(resp.id).then(respuesta => {
                    this._router.navigate([`/configuracion/tipo-embargos/${respuesta[0].id}/editar`], { queryParams: { tab: 1 } }); 
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
                if (resp.status === 400 && 'errors' in error) {
                    if ('salarioMinimoEmbargable' in error.errors) {
                        const errores = {};
                        error.errors.salarioMinimoEmbargable.forEach(element => {
                            errores[element] = true;
                        });
                        this.salarioMinimoEmbargable.setErrors(errores);
                    }

                    if ('nombre' in error.errors) {
                        const errores = {};
                        error.errors.nombre.forEach(element => {
                            errores[element] = true;
                        });
                        this.nombre.setErrors(errores);
                    }

                    if ('conceptoNominaId' in error.errors) {
                        const errores = {};
                        error.errors.conceptoNominaId.forEach(element => {
                            errores[element] = true;
                        });
                        this.conceptoNominaId.setErrors(errores);
                    }

                    if ('prioridad' in error.errors) {
                        const errores = {};
                        error.errors.prioridad.forEach(element => {
                            errores[element] = true;
                        });
                        this.prioridad.setErrors(errores);
                    }
                }
            });
    }

}

