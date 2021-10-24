import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';

@Component({
    selector: 'costos-cargo-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    centroOperativos: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _service: ListarService
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            cargo: [this.element.cargo, []],
            centroOperativo: [this.element.centroOperativo, []],
            nombreCentroCosto: [this.element.nombreCentroCosto, []],
            codigoCentroCosto: [this.element.codigoCentroCosto, []],
            fechaCorte: [this.element.fechaCorte, []],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this._service.getCentroOperativos().then((resp) => {
            this.centroOperativos = resp;
        });
    }

    get cargo(): AbstractControl {
        return this.form.get('cargo');
    }
    get centroOperativo(): AbstractControl {
        return this.form.get('centroOperativo');
    }

    get nombreCentroCosto(): AbstractControl {
        return this.form.get('nombreCentroCosto');
    }
    get codigoCentroCosto(): AbstractControl {
        return this.form.get('codigoCentroCosto');
    }

    get fechaCorte(): AbstractControl {
        return this.form.get('fechaCorte');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/nomina/costos-cargo'],
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
            ['/nomina/costos-cargo'],
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
