import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { tipoGastoViaje, tipoGastoViajeMostrar } from '@alcanos/constantes/gasto-viajes';
@Component({
    selector: 'embargos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    tipoGastosViajeObtener: any[] = [];


    gastoViajeM = {
        0:'Base retefuente GV',
        1:'Base viaticos alimentación',
        2:'Base viaticos hospedaje',
        4:'Faltante de viáticos',
        5:'Pago de anticipo por GV',
        6:'Viáticos alimentación',
        3:'Viaticos base retefuente',
        7:'Viáticos hospedaje',
    }

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
        this._service.getTipoGastosViaje();
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
            tipoGastoViajes: [this.element.tipoGastoViajes, []],
            fecha: [(this.element.fecha) ? moment(this.element.fecha).format('YYYY-MM-DD') : null, []],
            estado: [this.element.estado, []]
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this._service.onTipoGastosViajeChange.subscribe((resp) => {
            this.tipoGastosViajeObtener = resp;
        });
    }

    get numeroDocumento(): AbstractControl {
        return this.form.get('numeroDocumento');
    }

    get primerNombre(): AbstractControl {
        return this.form.get('primerNombre');
    }

    get primerApellido(): AbstractControl {
        return this.form.get('primerApellido');
    }

    get tipoGastoViajes(): AbstractControl {
        return this.form.get('tipoGastoViajes');
    }

    get fecha(): AbstractControl {
        return this.form.get('fecha');
      }

    get estado(): AbstractControl {
        return this.form.get('estado');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/novedades/gastos-viaje/'],
            {
                queryParams: {
                    $filter: true,
                },
            });
        this.dialogRef.close({});
    }

    buscarHandle(event): void {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const formValue = this.form.value;
        formValue.fecha = formValue.fecha  ?  moment(formValue.fecha).format('YYYY-MM-DD') : null; 
        this._router.navigate(
            ['/novedades/gastos-viaje/'],
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
