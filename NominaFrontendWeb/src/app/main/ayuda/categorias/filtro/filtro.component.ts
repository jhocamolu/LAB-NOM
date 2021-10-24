import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { FiltroService } from './filtro.service';

@Component({
    selector: 'ayuda-categoria-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {
    categoriaOptions: any[] = [];
    form: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _service: FiltroService,
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            orden: [this.element.orden, [Validators.min(0), Validators.max(9999)]],
            nombre: [this.element.nombre, [AlcanosValidators.maxLength(64)]],
            categoriaId: [this.element.categoriaId],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.selectDatos();
    }

    get orden(): AbstractControl {
        return this.form.get('orden');
    }

    get nombre(): AbstractControl {
        return this.form.get('nombre');
    }

    get categoriaId(): AbstractControl {
        return this.form.get('categoriaId');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/ayuda/categorias'],
            {
                queryParams: {
                    $filter: true
                },
                queryParamsHandling: 'merge',
            });
        this.dialogRef.close({});

    }

    public selectDatos(): void {
        this._service.getCategoriasLista().then((resp: any[]) => {
            this.categoriaOptions = resp;
        });
    }

    buscarHandle(event): void {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        this._router.navigate(
            ['/ayuda/categorias'],
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
