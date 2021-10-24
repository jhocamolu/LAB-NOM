import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { RequisitoService } from './requisito.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
    selector: 'requisito-crear',
    templateUrl: './requisito.component.html',
    styleUrls: ['./requisito.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RequisitoComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    requisitosOptions: any[] = [];
    tipoBeneficioId: any;

    constructor(
        public dialogRef: MatDialogRef<RequisitoComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _service: RequisitoService,
        private _alcanosSnackBar: AlcanosSnackBarService,
    ) {
        this.form = this._formBuilder.group({
            tipoSoporteId: [null, [Validators.required]],
        });
        this.submit = false;
    }

    ngOnInit(): void {
        this.selectTipoSoportesLista();
    }

    public selectTipoSoportesLista(): void {
        this._service.getTipoSoportesLista().then(
            (resp: any[]) => {
                this.requisitosOptions = resp;
                
            });
    }

    get tipoSoporteId(): AbstractControl {
        return this.form.get('tipoSoporteId');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;
        formValue.tipoBeneficioId = parseInt( this.element.id, 10 ); 

        this._service.crear(formValue).then((resp) => {
            this.dialogRef.close(resp);
        }).catch((resp: HttpErrorResponse) => {
            this.submit = true;
            let error = resp.error;
            if (typeof resp.error === 'string') {
              error = JSON.parse(resp.error);
            } else {
              error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('tipoSoporteId' in error.errors) {
                    const errores = {};
                    error.errors.tipoSoporteId.forEach(element => {
                        errores[element] = true;
                    });
                    this.tipoSoporteId.setErrors(errores);
                }
            }
        });

    }

}
