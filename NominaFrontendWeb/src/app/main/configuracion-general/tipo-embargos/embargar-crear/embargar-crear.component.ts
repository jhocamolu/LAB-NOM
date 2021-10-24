import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from '../editar/editar.service'; 


@Component({
    selector: 'embargar-crear',
    templateUrl: './embargar-crear.component.html',
    styleUrls: ['./embargar-crear.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EmbargarCrearComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    dependenciasOptions: any[] = [];
    conceptoNomina: any[];

    constructor(
        public dialogRef: MatDialogRef<EmbargarCrearComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _formBuilder: FormBuilder,
        private _service: EditarService,
    ) {
        this.form = this._formBuilder.group({
            conceptoNominaId: [null, [Validators.required]],
            maximoEmbargarConcepto: [null, [Validators.required, Validators.max(100)]],
        });
        this.submit = false;
    }

    ngOnInit(): void {
        this._service.getConceptoNominaCalculo().then(resp => {
            this.conceptoNomina = resp; 
        });
     }
   
    get conceptoNominaId(): AbstractControl {
        return this.form.get('conceptoNominaId');
    }

    get maximoEmbargarConcepto(): AbstractControl {
        return this.form.get('maximoEmbargarConcepto');
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;
        formValue.tipoEmbargoId = this.element;

        this._service.crearConcepto(formValue).then((resp) => {
            this.dialogRef.close(true);
        }).catch((resp: HttpErrorResponse) => {
            this.submit = true;
            let error = resp.error;
            if (typeof resp.error === 'string') {
              error = JSON.parse(resp.error);
            } else {
              error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('conceptoNominaId' in error.errors) {
                    const errores = {};
                    error.errors.conceptoNominaId.forEach(element => {
                        errores[element] = true;
                    });
                    this.conceptoNominaId.setErrors(errores);
                }
                if ('maximoEmbargarConcepto' in error.errors) {
                    const errores = {};
                    error.errors.maximoEmbargarConcepto.forEach(element => {
                        errores[element] = true;
                    });
                    this.maximoEmbargarConcepto.setErrors(errores);
                }
            }
        });

    }

}
