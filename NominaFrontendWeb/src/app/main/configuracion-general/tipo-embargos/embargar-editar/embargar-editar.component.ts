import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EditarService } from '../editar/editar.service'; 


@Component({
    selector: 'embargar-editar',
    templateUrl: './embargar-editar.component.html',
    styleUrls: ['./embargar-editar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EmbargarEditarComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    dependenciasOptions: any[] = [];
    conceptoNomina: any[];
    item: any; 
    constructor(
        public dialogRef: MatDialogRef<EmbargarEditarComponent>,
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
        this._service.getConceptoNominaCalculoEditar(this.element.dato.id).then(
            (response: any) => {
                this.item = response;
                if (response != null) {
                    this.form.patchValue({
                        maximoEmbargarConcepto: this.item.maximoEmbargarConcepto,
                        conceptoNominaId: this.item.conceptoNominaId,
                    });

                }
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
        formValue.tipoEmbargoId = parseInt( this.element.id, 10 );
        formValue.id =  this.element.dato.id;
      
        this._service.editarConcepto(this.item.id, formValue).then((resp) => {
            this.dialogRef.close(true);
        }).catch((resp: HttpErrorResponse) => {
            this.submit = false;
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
