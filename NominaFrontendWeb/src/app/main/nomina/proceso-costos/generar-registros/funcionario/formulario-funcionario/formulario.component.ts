import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FormularioActividadFuncionarioService } from './formulario.service';

// Autocompletable
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'costos-formulario-funcionario',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class FormularioActividadFuncionarioComponent implements OnInit {

    form: FormGroup;
    submit: boolean;
    espera: boolean;
    datos: any;
    filteredCentroCostos: Observable<string[]>;
    centroCostos: any[];
    aprobarRegistroServer: boolean;
    aprobarRegistroStorage: boolean;

    constructor(
        public dialogRef: MatDialogRef<FormularioActividadFuncionarioComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: FormularioActividadFuncionarioService,
    ) {
        this.espera = false;
        this.form = this._formBuilder.group({
            id: [null],
            actividadCentroCostoId: [null],
            centroCosto: [null, [Validators.required]],
            porcentaje: [null, [Validators.required]]
        });
        this.datos = data;
    }

    ngOnInit(): void {

        if (this.datos.id != null && this.datos != undefined) {
            this.form.patchValue({
                id: this.datos.id,
                centroCosto: this.datos.informacion.actividadCentroCosto.centroCosto,
                porcentaje: Number(this.datos.informacion.porcentaje * 100),
                actividadCentroCostoId: Number(this.datos.informacion.actividadCentroCostoId)
            });
        }

        this.filteredCentroCostos = this.form.get('centroCosto')
            .valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getCentroCostosFiltro(value))
            );
    }

    validarRegistroServer() {
        if (this.datos != null) {

            if (this.datos.informacion != null || this.datos.informacion) {
                let percent = 0;
                this.datos.informacion.forEach(element => {
                    percent += element.porcentaje;
                });
                this.aprobarRegistroServer = percent >= 1 ? true : false;
            }
        }
    }

    guardarHandle(event): void {

        this.submit = true;
        this.espera = true;
        const formValue = this.form.value;
        formValue.fechaCorte = this.datos.url.fechaInicioVigencia;
        formValue.tipoDistribucion = this.data.url.agregar;

        if (this.data.url.funcionarioId) {
            formValue.funcionarioId = Number(this.data.url.funcionarioId);
        }

        if (this.data.url.cargoId) {
            formValue.cargoId = this.data.url.cargo;
        } else {
            formValue.cargoId = null;
        }

        if (this.data.url.centroOperativoId) {
            formValue.centroOperativoId = this.data.url.centroOperativo;
        } else {
            formValue.centroOperativoId = null;
        }

        formValue.estado = 'Pendiente';


        // guardar
        if (this.data.id == null) {
            if (formValue.centroCosto != null && formValue != undefined) {
                formValue.centroCostoId = formValue.centroCosto.centroCostoId;
                formValue.actividadCentroCosto = formValue.centroCosto.actividadCentroCosto;
                formValue.centroCosto = formValue.centroCosto.centroCosto;
            }

            if (this.form.get('centroCosto').value) {
                formValue.actividadCentroCostoId = this.form.get('centroCosto').value.actividadCentroCostoId;
            }
            // Insertar un Id temporal al storage editar / borrar
            if (formValue.id == null) {
                if (JSON.parse(localStorage.getItem('carga')) != null) {
                    formValue.id = Number(100000000000 + JSON.parse(localStorage.getItem('carga')).length + 1);
                } else {
                    formValue.id = Number(100000000000 + 1);
                }
            }
            let a = [];

            formValue.cargado = 'guardar';


            formValue.formaRegistro = 'Storage';

            a.push(formValue);
            // Datos en BD cargados
            let percent = 0;
            if (this.datos.items != null || this.datos.items) {
                this.datos.items.forEach(element => {
                    percent += element.porcentaje;
                });
            }

            // Datos en localstorage cargados
            let validacion = 0;
            let repetido = false;
            if (localStorage.getItem('carga') != null) {

                if (localStorage.getItem('carga').length > 0) {

                    JSON.parse(localStorage.getItem('carga')).forEach(element => {
                        validacion += Number(element.porcentaje);
                        if (element.actividadCentroCostoId == formValue.actividadCentroCostoId) {
                            repetido = true;
                        }
                    });

                    if (Number(validacion) < 101) {
                        JSON.parse(localStorage.getItem('carga')).forEach(element => {
                            a.push(element);
                        });
                    }
                }
            }

            if (Number(percent) != null) {
                // localstorage - nuevo - bd
                if (repetido == false) {
                    if ((Number(validacion) + Number(formValue.porcentaje) + Number(percent)) < 101) {
                        localStorage.setItem('carga', JSON.stringify(a));
                    } else {
                        this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible incluir datos superiores a un 100% por favor revise' });
                    }
                } else {
                    this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible enviar datos duplicados de un centro de costo por favor Revise' });
                }
            }
            this.espera = false;
            this.dialogRef.close(true);
        }

        // editar
        if (this.data.id != null) {
            
            // Datos en localstorage cargados
            let validacionEditar = 0;
            let lastPorcentaje = 0;
            if (localStorage.getItem('carga') != null) {

                if (localStorage.getItem('carga').length > 0) {
                    // valida el porcentaje
                    JSON.parse(localStorage.getItem('carga')).forEach(element => {
                        if (formValue.id == element.id) {
                            lastPorcentaje = element.porcentaje;
                        }
                        validacionEditar += Number(element.porcentaje);
                    });

                    // impide el paso a ser menor de 101
                    if (((validacionEditar - lastPorcentaje) + formValue.porcentaje) < 101) {


                        if (typeof (formValue.centroCosto) !== 'undefined') {
                            formValue.centroCostoId = this.data.informacion.centroCostoId;
                            formValue.actividadCentroCosto = this.data.informacion.actividadCentroCosto;
                            formValue.centroCosto = this.data.informacion.centroCosto;
                        } else {
                            if (formValue.centroCosto != null) {
                                formValue.centroCostoId = formValue.centroCosto.centroCostoId;
                                formValue.actividadCentroCosto = formValue.centroCosto.actividadCentroCosto;
                                formValue.centroCosto = formValue.centroCosto.centroCosto;
                            }
                        }
                                               
                        if (formValue.id > 100000) {
                            formValue.formaRegistro = 'Storage';
                        }else {
                            formValue.formaRegistro = 'Manual';
                        }

                        this._service._generarRegistroEditarFuncionariosLocalStorage(formValue).then((resp) => {
                            if (resp == true) {
                                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                            }
                            localStorage.setItem('editado', JSON.stringify(true));
                            this.espera = false;
                            this.dialogRef.close(true);
                        }
                        ).catch((resp) => {
                            this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'Error inesperado' });
                        });
                    } else {
                        this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible incluir datos superiores a un 100% por favor revise' });
                    }
                }
            }
            this.espera = false;
            this.dialogRef.close(true);
        }
    }

    displayFnCentroCostos(element: any): string {
        if (element != null) {
            if (element.codigo != null && element.id != null) {
                return element ? `${element.codigo} - ${element.nombre}` : element;
            }
        }
        return element ? `${element.centroCosto.codigo} - ${element.centroCosto.nombre}` : element;
    }

}
