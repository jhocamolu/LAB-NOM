import { Component, OnInit, ViewEncapsulation, Optional, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
    selector: 'ausentismos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    ausentismoOptions: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _service: ListarService,
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
            tipoAusentismoId: [this.element.tipoAusentismoId],
            estado: [this.element.estado],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.selectTipoAusentismo();
    }

    public selectTipoAusentismo(): void {
        this._service.onTipoAusentismoChanged.subscribe(
            (resp: any[]) => {
                this.ausentismoOptions = resp;
            }
        );
    }


    get numeroDocumentoFuncionario(): AbstractControl {
        return this.form.get('numeroDocumentoFuncionario');
    }
    get tipoAusentismoId(): AbstractControl {
        return this.form.get('tipoAusentismoId');
    }
    get estado(): AbstractControl {
        return this.form.get('estado');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/novedades/ausentismos'],
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
            ['/novedades/ausentismos'],
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
