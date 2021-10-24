import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AprobarService } from './aprobar.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoPermisosAlcanos } from '@alcanos/constantes/estado-permisos';


@Component({
    selector: 'libranza-aprobar',
    templateUrl: './aprobar.component.html',
    styleUrls: ['./aprobar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AprobarComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    estadoPermisosAlcanos = estadoPermisosAlcanos;
    type: any;
    dato: any;

    constructor(
        public dialogRef: MatDialogRef<AprobarComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: AprobarService,
    ) {
        this.type = element.tipo;
        this.dato = element.dato;
        this.form = this._formBuilder.group({
            id: [element.dato.id],
            estado: [null, [Validators.required]],
            justificacion: [null, []],
        });
    }

    ngOnInit(): void {

        this.form.get('estado').valueChanges.subscribe(value => {
            if (value === 'Rechazada') {
                this.form.get('justificacion').setValidators([Validators.required]);
            } else {
                this.form.get('justificacion').clearValidators();
                this.form.get('justificacion').setErrors(null);
            }
            this.form.get('justificacion').updateValueAndValidity();
            /*Object.keys(this.form.controls).forEach(key => {
                console.log(`${key} es valido : ${this.form.get(key).valid}`);
                console.log(this.form.get(key).errors);
            });*/
        });
    }


    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    compareBooleanWith(o1: any, o2: any): boolean {
        return `${o1}` === `${o2}`;
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;            
        formValue.id = this.dato.id;

        this._service.estado(this.dato.id, formValue)
            .then((resp) => {
                this.dialogRef.close(true);
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
            }
            ).catch((resp: HttpErrorResponse) => {
                this.submit = false;
                let error = resp.error;
                if (typeof resp.error === 'string') {
                    error = JSON.parse(resp.error);
                } else {
                    error = resp.error;
                }
                if (resp.status === 400 && 'errors' in error) {

                    if ('snackbar' in error.errors) {
                        const errors = {};
                        error.errors.snackbar.forEach(element => {
                            this._alcanosSnackBar.snackbar({
                                clase: 'error',
                                mensaje: element,
                                time: 6000
                            });
                        });
                    }

                    if ('estado' in resp.error.errors) {
                        const errors = {};
                        resp.error.errors.estado.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('estado').setErrors(errors);
                    }
                    if ('justificacion' in resp.error.errors) {
                        const errors = {};
                        resp.error.errors.justificacion.forEach(element => {
                            errors[element] = true;
                        });
                        this.form.get('justificacion').setErrors(errors);
                    }
                }
            });
    }
}
