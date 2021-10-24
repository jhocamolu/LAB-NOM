import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
@Component({
    selector: 'embargos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    tipoDocumentosObtener: any[] = [];
    tipoEmbargosObtener: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
        this._service.getTipoEmbargosList();
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
            tipoEmbargo: [this.element.tipoEmbargo, []],
            estado: [this.element.estado, []]
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this._service.onTipoDocumentosChange.subscribe((resp) => {
            this.tipoDocumentosObtener = resp;
        });
        this._service.onTipoEmbargosChange.subscribe((resp) => {
            this.tipoEmbargosObtener = resp;
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

    get tipoEmbargo(): AbstractControl {
        return this.form.get('tipoEmbargo');
    }

    get estado(): AbstractControl {
        return this.form.get('estado');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/novedades/embargos/'],
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
            ['/novedades/embargos/'],
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
