import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { estadoRequisicionPersonalAlcanos } from '@alcanos/constantes/estado-requisicion-personal';
// Autocompletable
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';

@Component({
    selector: 'contratos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    estadoReqisicionPersonal = estadoRequisicionPersonalAlcanos;

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {

        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            fechaInicio: [this.element.fechaInicio, []],
            fechaFin: [this.element.fechaFin, []],
            funcionario: [this.element.funcionario, []],
            cargoSolicitante: [this.element.cargoSolicitante, []],
            cargoSolicitado: [this.element.cargoSolicitado, []],
            estado: [this.element.estado, []]
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
    }

    get fechaInicio(): AbstractControl {
        return this.form.get('fechaInicio');
    }
    get fechaFin(): AbstractControl {
        return this.form.get('fechaFin');
    }
    get funcionario(): AbstractControl {
        return this.form.get('funcionario');
    }
    get cargoSolicitante(): AbstractControl {
        return this.form.get('cargoSolicitante');
    }
    get cargoSolicitado(): AbstractControl {
        return this.form.get('cargoSolicitado');
    }
    get estado(): AbstractControl {
        return this.form.get('estado');
    }

    focusData(event): void {
        if (this.form.value.funcionario) {
            if (Number.isInteger(this.form.value.funcionario.id)) {
                this._service.getContratosFilter(this.form.value.funcionario.id).then((resp) => {

                    let errors = {};
                    if (resp['@odata.count'] > 0) {
                        for (let x = 0; x < resp['@odata.count']; x++) {
                            switch (resp.value[x].estado) {
                                case 'Vigente':
                                    errors = {};
                                    errors['El funcionario que ingresaste tiene un contrato vigente.'] = true;
                                    this.form.get('funcionario').setErrors(errors);
                                    break;
                                case 'SinIniciar':
                                    errors = {};
                                    errors['El funcionario que ingresaste tiene un contrato sin iniciar.'] = true;
                                    this.form.get('funcionario').setErrors(errors);
                                    break;
                                case 'Suspendido':
                                    errors = {};
                                    errors['El funcionario que ingresaste tiene un contrato suspendido.'] = true;
                                    this.form.get('funcionario').setErrors(errors);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                });
            }
        }
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/reclutamiento-seleccion/requisiciones-personal'],
            {
                queryParams: {
                    $filter: true,
                },
            });
        this.dialogRef.close({});
    }

    buscarHandle(event): void {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        this._router.navigate(
            ['/reclutamiento-seleccion/requisiciones-personal'],
            {
                queryParams: {
                    $filter: toUrlEncoded(this.form.value),
                    $top: 5,
                    $skip: 0,
                },
            });
        this.dialogRef.close(this.form.value);
    }

}
