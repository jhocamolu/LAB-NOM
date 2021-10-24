import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';

@Component({
    selector: 'sustitutos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    cargoOptions: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _service: ListarService,
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            cargoASustituir: [this.element.cargoASustituir, []],
            cargoSustituto: [this.element.cargoSustituto, []],
            fechaInicio: [(this.element.fechaInicio) ? moment(this.element.fechaInicio).format('YYYY-MM-DD') : null, []],
            fechaFinal: [(this.element.fechaFinal) ? moment(this.element.fechaFinal).format('YYYY-MM-DD') : null, []],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.cargos();
    }

    public cargos(): void {
        this._service.getCargos().then(resp => {
            this.cargoOptions = resp; 
        });
    }

    get cargoASustituir(): AbstractControl {
        return this.form.get('cargoASustituir');
    }
    get cargoSustituto(): AbstractControl {
        return this.form.get('cargoSustituto');
    }
    get fechaInicio(): AbstractControl {
        return this.form.get('fechaInicio');
    }
    get fechaFin(): AbstractControl {
        return this.form.get('fechaFin');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/flujo-trabajos/sustitutos'],
            {
                queryParams: {
                    $filter: true
                },
                queryParamsHandling: 'merge',
            });
        this.dialogRef.close({});

    }

    buscarHandle(event): void {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        this._router.navigate(
            ['/flujo-trabajos/sustitutos'],
            {
                queryParams: {
                    $filter: toUrlEncoded(this.form.value),
                    $top: 5,
                    $skip: 0,
                },
                queryParamsHandling: 'merge',
            });
        this.dialogRef.close(this.form.value);
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

}
