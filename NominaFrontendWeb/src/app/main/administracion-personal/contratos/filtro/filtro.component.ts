import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
@Component({
    selector: 'contratos-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    tipoDocumentosObtener: any[] = [];
    tipoContratosObtener: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
        this._service.getTipoDocumentosList();
        this._service.getTipoContratosList();
        this.element = this.element === null ? {} : this.element;

        this.form = this._formBuilder.group({
            numeroContrato: [this.element.numeroContrato, [AlcanosValidators.maxLength(15)]],
            tipoDocumento: [this.element.tipoDocumento, []],
          //  numeroDocumento: [this.element.numeroDocumento, [AlcanosValidators.maxLength(90), AlcanosValidators.numerico]],
            criterioBusqueda: [this.element.criterioBusqueda, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(40)]],
            tipoContrato: [this.element.tipoContrato, []],
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
        this._service.onTipoContratosChange.subscribe((resp) => {
            this.tipoContratosObtener = resp;
        });
    }

    get numeroContrato(): AbstractControl {
        return this.form.get('numeroContrato');
      }
      get tipoDocumento(): AbstractControl {
        return this.form.get('tipoDocumento');
      }
    //   get numeroDocumento(): AbstractControl {
    //     return this.form.get('numeroDocumento');
    //   }
      get criterioBusqueda(): AbstractControl {
        return this.form.get('criterioBusqueda');
      }
      get tipoContrato(): AbstractControl {
        return this.form.get('tipoContrato');
      }
      get estado(): AbstractControl {
        return this.form.get('estado');
      }
    

    limpiarHandle(event): void {
        this._router.navigate(
            ['/administracion-personal/contratos'],
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
            ['/administracion-personal/contratos'],
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
