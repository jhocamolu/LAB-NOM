import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FormularioActividadCargoService } from './formulario.service';

// Autocompletable
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'costos-formulario-cargo',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class FormularioActividadCargoComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    espera: boolean;
    datos: any;
    filteredCentroCostos: Observable<string[]>;
    centroCostos: any[];
    aprobarRegistroServer: boolean;
    aprobarRegistroStorage: boolean;

    constructor(
        public dialogRef: MatDialogRef<FormularioActividadCargoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioActividadCargoService,
    ) {
        this.espera = false;
        this.form = this._formBuilder.group({
            id: [null],
            centroCosto: [null, [Validators.required]],
            porcentaje: [null, [Validators.required]]
        });


    }

    ngOnInit(): void {
        if (this.data.id != null && this.data != undefined) {
            this.form.patchValue({
                id: this.data.id,
                centroCosto: this.data.informacion.centroCosto,
                porcentaje: Number(this.data.informacion.porcentaje) > 1 ? Number(this.data.informacion.porcentaje) : Number(this.data.informacion.porcentaje * 100)
            });
        }

        this.filteredCentroCostos = this.form.get('centroCosto')
            .valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getCentroCostosFiltro(value))
            );
    }

    get porcentaje(): AbstractControl {
        return this.form.get('porcentaje');
    }

    get centroCosto(): AbstractControl {
        return this.form.get('centroCosto');
    }

    guardarHandle(event): void {

        this.submit = true;
        this.espera = true;
        const formValue = this.form.value;
        formValue.fechaCorte = this.data.url.fechaInicioVigencia;
        formValue.tipoDistribucion = this.data.url.agregar;
        if (this.data.url.funcionarioId) {
            formValue.funcionarioId = null;
        }
        
        if (this.data.url.cargoId) {
            formValue.cargoId = Number(this.data.url.cargoId);
        } else {
            formValue.cargoId = null;
        }

        if (this.data.url.centroOperativoId) {
            formValue.centroOperativoId = Number(this.data.url.centroOperativoId);
        } else {
            formValue.centroOperativoId = null;
        }

        if (this.data.id == null) {
            formValue.actividadCentroCostoId = formValue.centroCosto.id; 

            // Insertar un Id temporal al storage editar / borrar
            if (formValue.id == null) {
                if (JSON.parse(localStorage.getItem('carga')) != null) {
                    formValue.id = Number(100000000000 + JSON.parse(localStorage.getItem('carga')).length + 1);
                } else {
                    formValue.id = Number(100000000000 + 1);
                }
            }
            let a = [];

            formValue.cargado = true;

            a.push(formValue);

            // Datos en localstorage cargados
            let validacion = 0;
            if (localStorage.getItem('carga') != null) {

                if (localStorage.getItem('carga').length > 0) {

                    JSON.parse(localStorage.getItem('carga')).forEach(element => {
                        validacion += Number(element.porcentaje);
                    });

                    if (Number(validacion) < 101) {
                        JSON.parse(localStorage.getItem('carga')).forEach(element => {
                            a.push(element);
                        });
                    }
                }
            }

            // localstorage - nuevo
            if ((Number(validacion) + Number(formValue.porcentaje)) < 101) {
                localStorage.setItem('carga', JSON.stringify(a));
            } else {
                this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible incluir datos superiores a un 100% por favor revise' });
            }


            this.espera = false;
            this.dialogRef.close(true);

        } else {
            this._service._generarRegistroEditarFuncionariosLocalStorage(this.data.id, formValue).then((resp) => {
                if (resp == true) {
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                }
                this.espera = false;
                this.dialogRef.close(true);
            }
            ).catch((resp) => {
                this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'Error Inesperado' });
            });

            this.espera = false;
            this.dialogRef.close(true);
        }

    }

    displayFnCentroCostos(element: any): string {
        return element ? `${element.centroCosto.codigo} - ${element.centroCosto.nombre}` : element;
    }
}
