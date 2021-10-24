import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FormularioService } from './formulario.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
    selector: 'distribucion-costos-conceptos-formulario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ConceptosFormularioComponent implements OnInit {

    form: FormGroup;

    filteredCuentaContables: Observable<string[]>;
    item: any;
    id: any = null;
    actividadId: number;

    desabilitar: boolean;
    submit: boolean;
    //
    paises: any[];
    departamentosOrigen: any[];
    municipiosOrigen: any[];
    centroCostos: any[];

    constructor(
        public dialogRef: MatDialogRef<ConceptosFormularioComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioService,
    ) {
        // console.log(data);
        this.departamentosOrigen = [];
        this.municipiosOrigen = [];
        this.id = data.id;
        this.actividadId = data.actividadId;


        this._service.getPaises().then((resp) => {
            this.paises = resp;
            this._departamentos(resp[0].id, this.departamentosOrigen);
        });


        this.form = this._formBuilder.group({
            id: [data.id],
            departamentoOrigenId: [null, [Validators.required]],
            municipioOrigenId: [null, [Validators.required]],
            centroCosto: [null, [Validators.required]],
        });
        if (data.id) {
            this.form.markAllAsTouched();
        }
        this.submit = false;
    }

    ngOnInit(): void {

        if (this.id != undefined) {
            this._service.getActividadCentroCostos(this.id).then(data => {
                if (data) {
                    this.item = data;
                    this._service.getCentroCostos(data.municipio.codigo).then((response: any[]) => {
                        this.centroCostos = response;
                    });
                    this.form.patchValue({
                        id: data.id,
                        departamentoOrigenId: data.municipio.divisionPoliticaNivel1Id,
                        municipioOrigenId: data.municipioId,
                        centroCosto: data.centroCostoId,
                    });

                }
            });
            setTimeout(() => {
                this.form.markAllAsTouched();
            }, 1000);
        }

        this.form.get('departamentoOrigenId').valueChanges.subscribe(
            (value) => {
                this.municipiosOrigen = [];
                this.form.get('municipioOrigenId').setValue(null);
                if (value != null) {
                    this._municipios(value, this.municipiosOrigen);
                }
            }
        );

        this.form.get('municipioOrigenId').valueChanges.subscribe(
            (value) => {
                this.form.get('centroCosto').setValue(null);
                if (value != null) {
                    if (value != undefined) {
                        this._service.getMunicipiosId(value).then((response: any[]) => {
                            this.centroCostos = response;
                        });
                    }
                }
            }
        );

    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;
        if (formValue.centroCosto) {
            formValue.centroCostoId = formValue.centroCosto;
        }
        if (formValue.municipioOrigenId) {
            formValue.municipioId = formValue.municipioOrigenId;
        }

        formValue.actividadId = this.actividadId;

        this._service.upsert(formValue).then((resp) => {
            this.submit = false;
            this.dialogRef.close(true);
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {
            this.submit = false;
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('divisionPoliticaNivel1Id' in error.errors) {
                    const errores = {};
                    error.errors.centroCostoId.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('divisionPoliticaNivel1Id').setErrors(errores);
                }
            }
            if (resp.status === 400 && 'errors' in error) {
                if ('municipioId' in error.errors) {
                    const errores = {};
                    error.errors.municipioId.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('municipioOrigenId').setErrors(errores);
                }
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('centroCostoId' in error.errors) {
                    const errores = {};
                    error.errors.centroCostoId.forEach(element => {
                        errores[element] = true;
                    });
                    this.form.get('centroCosto').setErrors(errores);
                }
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('snack' in error.errors) {
                    let msg = '';
                    error.errors.snack.forEach(element => {
                        msg = element;
                    });
                    this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: msg,
                        time: 5000
                    });
                }
            }

        });

    }


    private _departamentos(paisId, array: any[]): void {
        this._service.getDepartamentos(paisId).then(
            (response: any[]) => {
                response.forEach(element => {
                    array.push(element);
                });
            }
        );
    }

    private _municipios(departamentoId, array: any[]): void {
        this._service.getMunicipios(departamentoId).then(
            (response: any[]) => {
                response.forEach(element => {
                    array.push(element);
                });
            }
        );
    }
}
