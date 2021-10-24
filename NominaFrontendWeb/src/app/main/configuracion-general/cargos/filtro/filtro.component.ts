import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EditarService } from '../editar/editar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
    selector: 'cargos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    cargoOptions: any[] = [];

    nivelCargoOptions: any[] = [];
    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: EditarService,
    ) {

        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            codigo: [this.element.codigo, [ AlcanosValidators.maxLength(10), AlcanosValidators.alfanumerico]],
            nombre: [this.element.nombre, [ AlcanosValidators.maxLength(40),  AlcanosValidators.alfanumerico]],
            objetivoCargo: [this.element.objetivoCargo, []],
            nivelCargoId: [this.element.nivelCargoId, []],
            clase: [this.element.clase, []],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.selectNivelCargosLista();
    }

    public selectNivelCargosLista(): void {
        this._service.getNivelCargoLista().then(
            (resp: any[]) => {
                this.nivelCargoOptions = resp;
            }
        );
    }

    get codigo(): AbstractControl {
        return this.form.get('codigo');
    }
    
    get nombre(): AbstractControl {
        return this.form.get('nombre');
    }

    get nivelCargoId(): AbstractControl {
        return this.form.get('nivelCargoId');
    }

    get clase(): AbstractControl {
        return this.form.get('clase');
    }

    

    limpiarHandle(event): void {
        this._router.navigate(
            ['/configuracion/cargos'],
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
            ['/configuracion/cargos'],
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
