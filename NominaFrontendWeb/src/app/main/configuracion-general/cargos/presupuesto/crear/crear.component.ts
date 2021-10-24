import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { PresupuestoCrearService } from './crear.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import * as moment from 'moment';

export interface CargoPresupuestos {
    id: number;
    nombre: string;
}
@Component({
    selector: 'presupuesto-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PresupuestoCrearComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    anios: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<PresupuestoCrearComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: PresupuestoCrearService,
    ) {
        this.form = this._formBuilder.group({
            cargoId: [element],
            annoVigenciaId: [null, [Validators.required, AlcanosValidators.maxLength(40)]],
            cantidad: [null, [Validators.required, AlcanosValidators.numerico ,Validators.min(1), Validators.max(100)]],
        });
        this.submit = false;
    }

    ngOnInit(): void {
        this._service.getAnnoVigencia().then(( resp ) => {
            this.anios = resp; 
        });

        /// Este bloque alimenta this.anios con una fecha de hoy - 100 años se intercambia por el /odata/annoVigencias 
        // for (let i = 0; i <= 100; i++) {
        //     this.anios.push(moment(new Date()).year() - i);
        // }
        
    }

    get annoVigenciaId(): AbstractControl {
        return this.form.get('annoVigenciaId');
    }

    get cantidad(): AbstractControl {
        return this.form.get('cantidad');
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;
        
        this._service.crear(formValue).then((resp) => {
            this.submit = false;
            this.dialogRef.close(true);
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
                if ('annoVigenciaId' in error.errors) {
                    const errores = {};
                    error.errors.annoVigenciaId.forEach(element => {
                        errores[element] = true;
                    });
                    this.annoVigenciaId.setErrors(errores);
                }
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('cantidad' in error.errors) {
                    const errores = {};
                    error.errors.cantidad.forEach(element => {
                        errores[element] = true;
                    });
                    this.cantidad.setErrors(errores);
                }
            }
        });

    }

}
