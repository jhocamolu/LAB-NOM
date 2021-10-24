import { Component, OnInit, Inject, ViewEncapsulation, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';
import { AlcanosValidators } from '@alcanos/utils';
@Component({
    selector: 'funcionarios-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class FiltroComponent implements OnInit {

    form: FormGroup;
    dependenciasObtener: any[] = [];

    cargoOptions: any[] = [];
    estadoOptions: any[] = [];
    centroOperativosOptions: any[] = [];


    constructor(
        public dialogRef: MatDialogRef<FiltroComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService
    ) {
        this.element = this.element === null ? {} : this.element;
        this.form = this._formBuilder.group({
            numeroDocumento: [this.element.numeroDocumento, [AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(15)]],
            primerNombre: [this.element.primerNombre, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(90)]],
            primerApellido: [this.element.primerApellido, [AlcanosValidators.alfabetico, AlcanosValidators.maxLength(90)]],
            centroOperativo: [this.element.centroOperativo, []],
            cargo: [this.element.cargo, []],
            estado: [this.element.estado, []]
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({
            top: `0px`,
            right: `0px`
        });
        this.selectCargo();
        this.selectCentroOperativos();
    }

    public selectCargo(): void {
        this._service.getCargoEmpleadosList().then(
            (resp: any[]) => {
                this.cargoOptions = resp;
            }
        );
    }

    public selectCentroOperativos(): void {
        this._service.getCentroOperativosList().then(
            (resp: any[]) => {
                this.centroOperativosOptions = resp;
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

    get centroOperativo(): AbstractControl {
        return this.form.get('centroOperativo');
    }
    get cargo(): AbstractControl {
        return this.form.get('cargo');
    }
    get estado(): AbstractControl {
        return this.form.get('estado');
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/administracion-personal/funcionarios'],
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
            ['/administracion-personal/funcionarios'],
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
