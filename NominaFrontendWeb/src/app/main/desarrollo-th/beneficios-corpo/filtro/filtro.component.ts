import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';

@Component({
    selector: 'beneficios-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;

    tipoBeneficios: any;
    estadosBeneficios: any;

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
        // this._service.getBeneficiosList();
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
            tipoBeneficioId: [this.element.tipoBeneficioId, []],
            fechaSolicitud: [ this.element.fechaSolicitud ? moment(this.element.fechaSolicitud).format(`YYYY-MM-DD`) : null, []],
            estado: [this.element.estado, []]
        });
        this.estadosBeneficios = estadoBeneficiosAlcanos;
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });

        this._service.getTipoBeneficios().then((resp) => {
            this.tipoBeneficios = resp;
        });

    }

    get nombre(): AbstractControl {
        return this.form.get('nombre');
    }
    get conceptoNominaDevengoId(): AbstractControl {
        return this.form.get('conceptoNominaDevengoId');
    }


    limpiarHandle(event): void {
        this._router.navigate(
            ['/desarrollo-th/beneficios/'],
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
            ['/desarrollo-th/beneficios/'],
            {
                queryParams: {
                    $filter: toUrlEncoded(this.form.value),
                    $top: 5,
                    $skip: 0,
                },
            });
        this.dialogRef.close(this.form.value);
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }
}
