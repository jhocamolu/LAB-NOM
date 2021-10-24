import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';

@Component({
    selector: 'permisos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;

    tipoAusentismos: any;
    claseDevengo: any;

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _service: ListarService
    ) {

        this.element = this.element === null ? {} : this.element;

        if ( this.element.tipoAusentismoClase != null ) {
            this._service.getTipoAusentismos(this.element.tipoAusentismoClase).then((resp) => {
                this.tipoAusentismos = resp;
            });
        }

        this._service.getTipoAusentismosAll().then(resp => {
            this.tipoAusentismos = resp;
        });

        this.form = this._formBuilder.group({
            criterioBusqueda: [this.element.criterioBusqueda],
            primerNombre: [this.element.primerNombre],
            primerApellido: [this.element.primerApellido],
            tipoAusentismoClase: [this.element.tipoAusentismoClase],
            tipoAusentismoTipo: [this.element.tipoAusentismoTipo],
            estado: [this.element.estado],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });

        this._service.getClaseDevengo().then((resp) => {
            this.claseDevengo = resp;
        });

        this.form.get('tipoAusentismoClase').valueChanges.subscribe(
            (value) => {
                this.tipoAusentismos = [];
                this.form.get('tipoAusentismoTipo').setValue(null);
                if (value != null) {
                    this._tipoAusentismo(value, this.tipoAusentismos);
                }
            }
        );

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

    get tipoAusentismoClase(): AbstractControl {
        return this.form.get('tipoAusentismoClase');
    }

    get tipoAusentismoTipo(): AbstractControl {
        return this.form.get('tipoAusentismoTipo');
    }

    get estado(): AbstractControl {
        return this.form.get('estado');
    }


    limpiarHandle(event): void {
        this._router.navigate(
            ['/administracion-personal/permisos/'],
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
            ['/administracion-personal/permisos/'],
            {
                queryParams: {
                    $filter: toUrlEncoded(this.form.value),
                    $top: 5,
                    $skip: 0,
                },
            });
        this.dialogRef.close(this.form.value);
    }


    private _tipoAusentismo(tipoAusentismoClase, array: any[]): void {
        this._service.getTipoAusentismos(tipoAusentismoClase).then(
            (response: any[]) => {
                response.forEach(element => {
                    array.push(element);
                });
            }
        );
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }
}
