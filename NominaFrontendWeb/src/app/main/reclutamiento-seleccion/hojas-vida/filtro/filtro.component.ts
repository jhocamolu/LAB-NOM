import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
@Component({
    selector: 'hojas-vida-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    generos: any[] = [];
    dependenciasObtener: any[] = [];
    ocupacionOptions: any[] = [];


    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService,
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            numeroDocumento: [this.element.numeroDocumento, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(15)]],
            primerNombre: [this.element.primerNombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(90)]],
            primerApellido: [this.element.primerApellido, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(90)]],
            genero: [this.element.genero, []],
            ocupacion: [this.element.ocupacion, []],
            direccion: [this.element.direccion, []],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.selectOcupacion();
        this.selectGenero();

    }

    public selectOcupacion(): void {
        this._service.getOcupacionesList().then(
            (resp: any[]) => {
                this.ocupacionOptions = resp;
            }
        );
    }

    public selectGenero(): void {
        this._service.getGenerosList().then(
            (resp: any[]) => {
                this.generos = resp;
            }
        );
    }


    limpiarHandle(event): void {
        this._router.navigate(
            ['/reclutamiento-seleccion/hojas-vida'],
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
            ['/reclutamiento-seleccion/hojas-vida'],
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
