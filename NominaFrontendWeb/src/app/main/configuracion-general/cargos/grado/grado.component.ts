import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { GradoService } from './grado.service';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

export interface CargoGrados {
    id: number;
    nombre: string;
}
@Component({
    selector: 'grado-cargos-crear',
    templateUrl: './grado.component.html',
    styleUrls: ['./grado.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GradoComponent implements OnInit {

    form: FormGroup;
    submit: boolean;


    constructor(
        public dialogRef: MatDialogRef<GradoComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: GradoService,
    ) {
        this.form = this._formBuilder.group({
            cargoId: [element.cargoId],
            nombre: [null, [Validators.required, AlcanosValidators.maxLength(40)]],
            descripcion: [null, [Validators.required]],
        });
     
        this.submit = false;
    }

    ngOnInit(): void { }

    get nombre(): AbstractControl {
        return this.form.get('nombre');
    }

    get descripcion(): AbstractControl {
        return this.form.get('descripcion');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
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
                if ('nombre' in error.errors) {
                    const errores = {};
                    error.errors.nombre.forEach(element => {
                        errores[element] = true;
                    });
                    this.nombre.setErrors(errores);
                }
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('descripcion' in error.errors) {
                    const errores = {};
                    error.errors.descripcion.forEach(element => {
                        errores[element] = true;
                    });
                    this.descripcion.setErrors(errores);
                }
            }
        });

    }

}
