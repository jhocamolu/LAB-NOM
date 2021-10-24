import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { DependenciaService } from './dependencia.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

export interface CargoDependencias {
    id: number;
    dependenciaId: string;
}
@Component({
    selector: 'dependencia-cargos-crear',
    templateUrl: './dependencia.component.html',
    styleUrls: ['./dependencia.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DependenciaComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    dependenciasOptions: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<DependenciaComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _matSnackBar: MatSnackBar,
        private _service: DependenciaService,
    ) {
        this.form = this._formBuilder.group({
            dependenciaId: [null, [Validators.required]],
        });
        this.submit = false;
    }

    ngOnInit(): void {
        this.selectDependenciasLista();
    }

    public selectDependenciasLista(): void {
        this._service.getDependenciasLista().then(
            (resp: any[]) => {
                this.dependenciasOptions = resp;
            });
    }

    get dependenciaId(): AbstractControl {
        return this.form.get('dependenciaId');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;

        // El 10 es usado como radx en base 10 (decimal) leer la documentación del parseInt
        const newElement = parseInt(this.element.id, 10);
        formValue.cargoId = newElement;
        this._service.crear(formValue).then((resp) => {
            this.dialogRef.close(resp);
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {
            this.submit = true;
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('dependenciaId' in error.errors) {
                    const errores = {};
                    error.errors.dependenciaId.forEach(element => {
                        errores[element] = true;
                    });
                    this.dependenciaId.setErrors(errores);
                }
            }
        });

    }

}
