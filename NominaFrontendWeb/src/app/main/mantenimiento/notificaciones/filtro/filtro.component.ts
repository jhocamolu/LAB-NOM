import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';

@Component({
    selector: 'notificaciones-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;

    devengo: any; 

    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
       // this._service.getTipoNotificacionesList();
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            tipo: [this.element.tipo, []],
            titulo: [this.element.titulo, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(200)]],
            fecha: [ this.element.fecha ? moment(this.element.fecha).format(`YYYY-MM-DD`) : null, []],
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
      
    }

      get titulo(): AbstractControl {
        return this.form.get('titulo');
      }
      get tipo(): AbstractControl {
        return this.form.get('tipo');
      }
      get fecha(): AbstractControl {
        return this.form.get('fecha');
      }
    
    
    limpiarHandle(event): void {
        this._router.navigate(
            ['/mantenimiento/notificaciones/'],
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
            ['/mantenimiento/notificaciones/'],
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
