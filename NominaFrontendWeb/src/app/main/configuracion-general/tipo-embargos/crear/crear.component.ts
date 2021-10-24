import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

import { fuseAnimations } from '@fuse/animations';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosValidators } from '@alcanos/utils';
import { Router } from '@angular/router';


@Component({
    selector: 'tipo-embargos-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [fuseAnimations],
})
export class CrearComponent implements OnInit {
    form: FormGroup;
    submit: boolean;
    nivelCargoOptions: any[] = [];
    conceptoNomina: any[];
    conceptoAEmbargar: any[]; 
    id: number; 
    public element: any;

    selectedTab = 0;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: CrearService,
        private _matDialog: MatDialog,
        private _router: Router
    ) {
        this.form = this._formBuilder.group({
            nombre: [null, [Validators.required, AlcanosValidators.maxLength(100), AlcanosValidators.alfabetico]],
            salarioMinimoEmbargable: [null, [Validators.required]],
            conceptoNominaId: [null, [Validators.required]],
            prioridad: [null, [Validators.required, Validators.max(99), AlcanosValidators.numerico, Validators.min(1)]],
        });
        this.submit = false;
        this.id = this._service.id;
    }

    ngOnInit(): void {
        this._service.getConceptoNomina().then(resp => { this.conceptoNomina = resp; });
    }

    changeTab(): void {
        this.selectedTab += 1;
        if (this.selectedTab >= 3) {
            this.selectedTab = 0;
        }
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
        // se inyecta en el promise editar el id y el formValue
        this._service.crear(formValue)
            .then((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._service.getConceptoNominaCalculo(resp.id).then(respuesta => {
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

