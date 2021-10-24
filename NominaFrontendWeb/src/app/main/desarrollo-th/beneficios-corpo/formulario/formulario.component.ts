import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';
import * as moment from 'moment';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'formulario-beneficios',
    templateUrl: './formulario.component.html',
    styleUrls: ['./formulario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit {
    enviroments: string;

    form: FormGroup;
    form2: FormGroup;
    submit: boolean;
    item: any;

    beneficios: any[];
    tipoBeneficios: any[];
    filesToUpload: any[] = [];

    // permisos
    arrayPermisos: any;

    actualizaPrioridad: boolean;
    // Arrays si y no para integrarlo en forms
    filteredFuncionarios: Observable<string[]>;
    path: any;
    requisitos: any;
    count: number;

    desabilitar: boolean = false;
    id: number;

    msTamanio: any[] = [];
    msExtencion: any[] = [];

    // Perioricidad
    tipoPeriodos: any;
    subPeriodos: any[];

    tipoPeriodosOrigen = [];
    subPeriodosOrigen = [];

    allFiles: any[];
    requisitoList: any[];

    // Activaciones
    permiteAuxilioEducativo: boolean = true;
    permitePeriodoPago: boolean = true;
    permiteValorSolicitado: boolean = true;
    permitePlazoMes: boolean = true;
    permiteEstudio: boolean = true;
    permiteEstudioAuxilioEducativo: boolean = true;

    // validaciones
    timeLine: number = 0;
    cuotaPermitida: number;
    montoMax: any;

    beneficiosAdjuntos: any[];
    ListaAdjuntos: {};
    // tipo beneficio en memoria
    tipoBeneficio: any;
    /**
     *
     * @param _formBuilder
     * @param _matDialog
     * @param _router
     * @param _service
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: FormularioService,
        private _permisos: PermisosrService
    ) {
        this.submit = false;

        this.id = null;
        this.enviroments = environmentAlcanos.gestorArchivos;
        this.tipoPeriodos = this._service.onTipoPeriodosChanged.value;
        this.tipoBeneficios = this._service.onTipoBeneficiosChanged.value;
        this.subPeriodos = [];

        this.form = this._formBuilder.group(
            {
                id: [null, []],
                funcionario: [null, []],
                tipoBeneficioId: [null, []],
                fechaSolicitud: [null, []],
                tipoPeriodoId: [null, []],
                subPeriodoId: [null, []],
                valorSolicitud: [null, []],
                plazoMaximo: [null, []],
                opcionAuxilioEducativo: [null, []],
                cantidadHoraSemana: [null, []],
                fechaInicioEstudio: [null, []],
                fechaFinalizacionEstudio: [null, []],
                observacion: [null, [AlcanosValidators.maxLength(300)]],
                files: this._formBuilder.group({})
            }, { validators: this.validateBeneficios });

        let c = 0;
        this.tipoPeriodos.forEach(resp => {
            if (resp.pagoPorDefecto && c === 0) {
                this.form.patchValue({ tipoPeriodoId: resp.id });
                this._periodicidad(resp.id);
                c++;
            }
        });

        this.arrayPermisos = this._permisos.permisosStorage('BeneficioAdjuntos_');
    }

    ngOnInit(): void {
        // Determina si se observa o no el requisitos
        this.path = this._service.path;

        this._service.onItemChanged.subscribe((response: any) => {
            this.item = response;

            // EL formulario es totalmente dinamico es por esto que hago inicialización de validaciones tipo required aquí
            if (response == null) {
                this.form.get('funcionario').setValidators([Validators.required]);
                this.form.get('tipoBeneficioId').setValidators([Validators.required]);
                this.form.get('tipoPeriodoId').setValidators([Validators.required]);
                this.form.get('subPeriodoId').setValidators([Validators.required]);
                this.form.get('fechaSolicitud').setValidators([Validators.required]);
                this.form.get('valorSolicitud').setValidators([Validators.required]);
                this.form.get('plazoMaximo').setValidators([Validators.required]);
                this.form.get('opcionAuxilioEducativo').setValidators([Validators.required]);
                this.form.get('cantidadHoraSemana').setValidators([Validators.required]);
                this.form.get('fechaInicioEstudio').setValidators([Validators.required]);
                this.form.get('fechaFinalizacionEstudio').setValidators([Validators.required]);

            } else {


                // externas
                this.id = this.item.id;
                this.desabilitar = true;
                // internas
                let tipoPeriodoOrigen = null;

                if (this.item.tipoPeriodoId != null) {
                    tipoPeriodoOrigen = this.item.tipoPeriodoId;
                }

                if (tipoPeriodoOrigen !== null) {
                    this._editarPeriodicidad(this.item.id);
                }

                this._service.getRequisito(this.item.tipoBeneficioId).then(resp => {
                    const array = [];
                    resp.forEach(element => {
                        this._service.getBeneficiosAdjuntos(this.item.id, element.tipoSoporteId).then(resp => {
                            resp.forEach(el => {
                                array.push(el);
                            });
                        });
                    });
                    this.beneficiosAdjuntos = array;


                    /* Tener en cuenta pues es la base del recurso de archivos
                    if ( this.item ){
                      Object.keys(this.filesForm.controls).forEach(key => {
                        this.filesForm.removeControl(key);
                      });
                    }
                    resp.map(rmap => {
                      this.montoMax = rmap.tipoBeneficio.montoMaximo;
                      this.cuotaPermitida = rmap.tipoBeneficio.cuotaPermitida;
                      if ( this.item ){
                        this.filesForm.addControl(`file${rmap.id}`, new FormControl('', Validators.required));
                      }
                    });*/
                });

                this.form.patchValue({
                    id: this.item.id,
                    funcionario: this.item.funcionario,
                    tipoPeriodoId: this.item.tipoPeriodoId,
                    tipoBeneficioId: this.item.tipoBeneficioId,
                    fechaSolicitud: this.item.fechaSolicitud,
                    valorSolicitud: this.item.valorSolicitud,
                    plazoMaximo: this.item.plazoMaximo,
                    opcionAuxilioEducativo: this.item.opcionAuxilioEducativo,
                    cantidadHoraSemana: this.item.cantidadHoraSemana,
                    fechaInicioEstudio: this.item.fechaInicioEstudio,
                    fechaFinalizacionEstudio: this.item.fechaFinalizacionEstudio,
                    observacion: this.item.observacion
                });

                // Desabilitar campos en el editar
                this.form.get('funcionario').disable();
                this.form.get('tipoBeneficioId').disable();
                this.form.get('fechaSolicitud').disable();
                // Accciones para ocultar campos
                this.permitirPeriodicidad(this.item.tipoBeneficio.periodoPago);
                this.permitirValorSolicitado(this.item.tipoBeneficio.valorSolicitado);
                this.permitirPlazoMes(this.item.tipoBeneficio.plazoMes);

                this.permitirEstudio(this.item.tipoBeneficio.permisoEstudio);
                this.permitirEstudioAuxilioEducativo(this.item.tipoBeneficio.permisoEstudio, this.item.tipoBeneficio.permiteAuxilioEducativo);
                this.permitirAuxilioEducativo(this.item.tipoBeneficio.permiteAuxilioEducativo);


                if (this.item.tipoBeneficio.periodoPago) {
                    this.form.get('subPeriodoId').clearValidators();
                    this.form.get('tipoPeriodoId').setValidators([Validators.required]);
                    this.form.get('tipoPeriodoId').setErrors(null);
                }

                this.form.markAllAsTouched();

            } // end if response value
        } // end service + patchvalue
        );

        this.form.get('tipoPeriodoId').valueChanges.subscribe(value => {
            this.subPeriodos = [];
            this.form.get('subPeriodoId').setValue(null);
            if (value != null) {
                this._periodicidad(value);
            }
        });

        //Si el campo ValorSolicitado, en su parametrización,
        //se encuentra con el valor en SI para este tipo de beneficio,
        //se debe visualizar este control

        //Si el campo PeriodoPago, en su parametrización, se encuentra con el valor en SI para
        //este tipo de beneficio, se debe visualizar este control.
        this.form.get('tipoBeneficioId').valueChanges.subscribe(value => {
            this.tipoBeneficios.forEach(data => {

                if (value === data.id) {
                    this.permitirValorSolicitado(data.valorSolicitado);
                    this.permitirPlazoMes(data.plazoMes);
                    this.permitirPeriodicidad(data.periodoPago);
                    this.permitirEstudio(data.permisoEstudio);
                    this.permitirEstudioAuxilioEducativo(data.permisoEstudio, data.permiteAuxilioEducativo);
                    this.permitirAuxilioEducativo(data.permiteAuxilioEducativo);
                }

            });

            this._service.getRequisito(value).then(resp => {
                this.requisitoList = resp;
                if (!this.item) {
                    Object.keys(this.filesForm.controls).forEach(key => {
                        this.filesForm.removeControl(key);
                    });
                }
                resp.map(rmap => {
                    // valida el timeline = días totales del contrato VS dias de antiguedad del tipo de beneficio
                    if (this.timeLine > 0 && this.item == null) {
                        const errors = {};
                        if (
                            rmap.tipoBeneficio.diasAntiguedad >= this.timeLine
                        ) {
                            errors[
                                'El funcionario que intentas ingresar no cumple con la condición de antigüedad para acceder al beneficio.'
                            ] = true;
                            this.form.get('funcionario').setErrors(errors);
                        }
                    }
                    this.montoMax = rmap.tipoBeneficio.montoMaximo;
                    this.cuotaPermitida = rmap.tipoBeneficio.cuotaPermitida;
                    this.filesForm.addControl(`file${rmap.id}`, new FormControl('', Validators.required));
                });
            });
        });

        this.form.get('plazoMaximo').valueChanges.subscribe(value => {
            const errors = {};
            if (this.cuotaPermitida) {
                if (this.cuotaPermitida < value) {
                    errors[
                        'El plazo máximo en meses que ingresaste no debe ser mayor al establecido para el beneficio.'
                    ] = true;
                    this.form.get('plazoMaximo').setErrors(errors);
                }
            }
        });

        this.form.get('valorSolicitud').valueChanges.subscribe(value => {
            const errors = {};
            if (this.montoMax) {
                if (this.montoMax < value) {
                    errors[
                        `El valor que solicitas no debe ser mayor a $ ${this.montoMax}`
                    ] = true;
                    this.form.get('valorSolicitud').setErrors(errors);
                }
            }
        });

        this.filteredFuncionarios = this.form
            .get('funcionario').valueChanges.pipe(
                debounceTime(300),
                switchMap(value => this._service.getFuncionarios(value))
            );

        // Validación de campos 
        /* Object.keys(this.form.controls).forEach(key => {
           console.log(`${key} es valido : ${this.form.get(key).valid}`);
           console.log(this.form.get(key).errors);
         });*/

    }

    editarArchivoHandle(event, element): void {
        const dialogRef = this._matDialog.open(GestrorArchivosUploadComponent, {
            disableClose: false,
            data: element.adjunto,
        });
        dialogRef.afterClosed().subscribe(resp => {
            if (resp) {
                const informacion = {
                    id: element.id,
                    adjunto: resp.object_id
                };
                this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: resp.message });
                this._service._editarArchivo(informacion).then(resp => {

                    this._service.getRequisito(this.item.tipoBeneficioId).then(resp => {
                        const array = [];
                        resp.forEach(element => {
                            this._service.getBeneficiosAdjuntos(this.item.id, element.tipoSoporteId).then(resp => {
                                resp.forEach(el => {
                                    array.push(el);
                                });
                            });
                        });
                        this.beneficiosAdjuntos = array;
                        this.submit = false;
                    });
                });
                this.submit = false;
            }
        });
    }

    permitirPeriodicidad(value: boolean): void {
        if (!value) {
            this.permitePeriodoPago = false;
            this.form.get('tipoPeriodoId').clearValidators();
            this.form.get('tipoPeriodoId').setErrors(null);
            this.form.get('subPeriodoId').clearValidators();
            this.form.get('subPeriodoId').setErrors(null);
            this.form.get('subPeriodoId').setValue(null);
        } else {
            this.permitePeriodoPago = true;
            this.form.get('tipoPeriodoId').setValidators([Validators.required]);
            this.form.get('subPeriodoId').setValidators([Validators.required]);
        }
    }

    permitirEstudio(value: boolean): void {
        if (!value) {
            this.permiteEstudio = false;
            this.form.get('cantidadHoraSemana').clearValidators();
            this.form.get('cantidadHoraSemana').setErrors(null);
            this.form.get('cantidadHoraSemana').setValue(null);
        } else {
            this.permiteEstudio = true;
            this.form.get('cantidadHoraSemana').setValidators([Validators.required, AlcanosValidators.numerico, Validators.max(1000)]);

        }
    }

    permitirAuxilioEducativo(value: boolean): void {
        if (!value) {
            this.permiteAuxilioEducativo = false;
            this.form.get('opcionAuxilioEducativo').clearValidators();
            this.form.get('opcionAuxilioEducativo').setErrors(null);
            this.form.get('opcionAuxilioEducativo').setValue(null);
        } else {
            this.permiteAuxilioEducativo = true;
            this.form.get('opcionAuxilioEducativo').setValidators([Validators.required]);
        }
    }

    permitirEstudioAuxilioEducativo(estudio: boolean, auxilio: boolean): void {
        if (!(estudio || auxilio)) {
            this.permiteEstudioAuxilioEducativo = false;
            this.form.get('fechaInicioEstudio').clearValidators();
            this.form.get('fechaInicioEstudio').setErrors(null);
            this.form.get('fechaInicioEstudio').setValue(null);
            this.form.get('fechaFinalizacionEstudio').clearValidators();
            this.form.get('fechaFinalizacionEstudio').setErrors(null);
            this.form.get('fechaFinalizacionEstudio').setValue(null);
        } else {
            this.permiteEstudioAuxilioEducativo = true;
            this.form.get('fechaInicioEstudio').setValidators([Validators.required]);
            this.form.get('fechaFinalizacionEstudio').setValidators([Validators.required]);
        }
    }

    permitirValorSolicitado(value: boolean): void {
        if (!value) {
            this.permiteValorSolicitado = false;
            this.form.get('valorSolicitud').clearValidators();
            this.form.get('valorSolicitud').setErrors(null);
            this.form.get('valorSolicitud').setValue(null);
        } else {
            this.permiteValorSolicitado = true;
            this.form.get('valorSolicitud').setValidators([Validators.required]);
        }
    }

    permitirPlazoMes(value: boolean): void {
        if (!value) {
            this.permitePlazoMes = false;
            this.form.get('plazoMaximo').clearValidators();
            this.form.get('plazoMaximo').setErrors(null);
            this.form.get('plazoMaximo').setValue(null);
        } else {
            this.permitePlazoMes = true;
            this.form.get('plazoMaximo').setValidators([Validators.required, AlcanosValidators.numerico, Validators.max(20)]);
        }
    }

    get filesForm(): FormGroup {
        return this.form.get('files') as FormGroup;
    }


    fileInputHandle(event, id: string): void {
        // v3 formato y tamaño del docuemnto a anexar
        let errors = {};
        const idFile = event.target;
        const validFileExtensions = ['pdf', 'png', 'jpg'];
        const extension = event.target.files[0].name.split('.').pop();
        const maxFileSize = 5242880; // unidad de medida bits (5 Mb)


        if (validFileExtensions.includes(extension) == false) {
            errors['El archivo no tiene una extensión válida.'] = true;
            this.form.get('files.file' + id).setErrors(errors);
        }

        if (event.target.files[0].size > maxFileSize) {
            errors['El archivo tiene un tamaño mayor al máximo permitido.'] = true;
            this.form.get('files.file' + id).setErrors(errors);
        }
        let lists: any;
        this.filesToUpload.map((resp) => {
            if (resp.id == id) {
                lists = this.filesToUpload.filter(x => {
                    return x.id != id;
                });
                this.filesToUpload = lists;
            }
        });

        if (event.target.files && event.target.files.length) {
            this.filesToUpload.push({
                id: id,
                file: event.target.files[0]
            });
        }
    }

    focusData(event): void {
        if (this.form.value.funcionario && this.form.value.funcionario.id) {
            // CA 01 - 02 HU061 V1
            this._service.getDatosActuales(this.form.value.funcionario.id).then(resp => {
                const errors = {};
                let vig = false;
                let activo = false;
                if (resp.contrato != null) {
                    if (resp.contrato.estado !== 'Vigente') {
                        errors[
                            'El funcionario que intentas ingresar no cuenta con un contrato vigente, por favor revisa.'
                        ] = true;
                        this.form.get('funcionario').setErrors(errors);
                        vig = true;
                    }
                    if (resp.contrato.estadoRegistro !== 'Activo') {
                        errors[
                            'El funcionario que intentas ingresar no se encuentra activo, por favor revisa.'
                        ] = true;
                        this.form.get('funcionario').setErrors(errors);
                        activo = true;
                    }
                    if (vig !== true || activo !== true) {
                        const ahora = moment();
                        const fecha = resp.contrato.fechaInicio;
                        this.timeLine = ahora.diff(moment(fecha), 'days');
                    }
                }
                else {
                    errors[
                        'El funcionario no tiene contrato.'
                    ] = true;
                    this.form.get('funcionario').setErrors(errors);
                    activo = true;
                }
            });
        }
    }

    public deleteRequisito(event, id): void {
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
                clase: 'error'
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this._service.borrar(id).then(() => {
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                });
            }
        });
    }

    guardarHandle(event): void {
        this.submit = true;
        const formValue = this.form.value;

        // Object.keys(this.form.controls).forEach(key => {
        //     console.log(`${key} es valido : ${this.form.get(key).valid}`);
        //     console.log(this.form.get(key).errors);
        // });


        if (this.item == null) {
            formValue.funcionarioId = formValue.funcionario.id;
            formValue.funcionario = null;
            formValue.tipoBeneficioId = formValue.tipoBeneficioId;

            if (this.permitePeriodoPago == false) {
                formValue.tipoPeriodoId = null;
            }

        } else {
            if (this.permitePeriodoPago) {
                formValue.tipoPeriodoId = this.item.tipoPeriodoId;
            } else {
                formValue.tipoPeriodoId = null;
            }
        }
        formValue.plazoMaximo = parseInt(formValue.plazoMaximo, 10);
        //THH:mm:ssZ
        if (formValue.fechaSolicitud || this.item != null) {
            formValue.fechaSolicitud = moment(formValue.fechaSolicitud).format('YYYY-MM-DD');
        }
        if (formValue.fechaInicioEstudio) {
            formValue.fechaInicioEstudio = moment(formValue.fechaInicioEstudio).format('YYYY-MM-DD');
        }
        if (formValue.fechaFinalizacionEstudio) {
            formValue.fechaFinalizacionEstudio = moment(formValue.fechaFinalizacionEstudio).format('YYYY-MM-DD');
        }



        // Cargue de predefinidos del editar cuando no se encuentran activos
        if (this.item != null) {
            formValue.funcionarioId = this.item.funcionarioId;
            formValue.tipoBeneficioId = this.item.tipoBeneficioId;

            if (!this.permiteAuxilioEducativo) {
                formValue.opcionAuxilioEducativo = this.item.opcionAuxilioEducativo;
                formValue.cantidadHoraSemana = this.item.cantidadHoraSemana;
                formValue.fechaInicioEstudio = this.item.fechaInicioEstudio;
                formValue.fechaFinalizacionEstudio = this.item.fechaFinalizacionEstudio;
            }

            if (!this.permiteValorSolicitado) {
                formValue.valorSolicitud = this.item.valorSolicitud;
            }

            if (!this.permitePlazoMes) {
                formValue.plazoMaximo = this.item.plazoMaximo;
            }
        }

        // Cargue de beneficios subPeriodo
        const array: any[] = [];
        if (formValue.subPeriodoId) {
            formValue.subPeriodoId.forEach(element => {
                array.push({ subPeriodoId: element });
            });
        }

        // Accesos de prueba
        formValue.formaDesembolso = 'Nomina';
        // formValue.valorAutorizado = 150000;

        // Cargue de beneficios subPeriodo
        formValue.BeneficiosSubperiodos = array;

        // Archivos Cargar
        if (this.filesToUpload.length > 0) {
            this._service.uploadFilesPrev(this.filesToUpload).then(resp => {
                const array = [];
                resp.forEach((value, key) => {
                    array.push({
                        TipoBeneficioRequisitoId: this.filesToUpload[key].id,
                        adjuntoId: value.object_id
                    });
                });
                formValue.BeneficiosAdjuntos = array;
                this._guardarForm(formValue);
            });
        } else {
            this._guardarForm(formValue);
        }
        return null;
    } // Guardar Handle



    private _guardarForm(formValue): void {
        this._service.upsert(formValue).then(resp => {
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
            this._router.navigate([`/desarrollo-th/beneficios`]);
            this.submit = false;
        }).catch((resp: HttpErrorResponse) => {
            this.submit = false;
            let error = resp.error;
            if (typeof resp.error === 'string') {
                error = JSON.parse(resp.error);
            } else {
                error = resp.error;
            }

            if (resp.status === 400 && 'errors' in error) {
                if ('funcionarioId' in error.errors) {
                    const errors = {};
                    error.errors.funcionarioId.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('funcionario').setErrors(errors);
                }

                if ('tipoBeneficioId' in error.errors) {
                    const errors = {};
                    error.errors.tipoBeneficioId.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('tipoBeneficioId').setErrors(errors);
                }

                if ('tipoperiodoId' in error.errors) {
                    const errors = {};
                    error.errors.tipoperiodoId.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('tipoperiodoId').setErrors(errors);
                }

                if ('fechaSolicitud' in error.errors) {
                    const errors = {};
                    error.errors.fechaSolicitud.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('fechaSolicitud').setErrors(errors);
                }

                if ('valorSolicitud' in error.errors) {
                    const errors = {};
                    error.errors.valorSolicitud.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('valorSolicitud').setErrors(errors);
                }

                if ('plazoMaximo' in error.errors) {
                    const errors = {};
                    error.errors.plazoMaximo.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('plazoMaximo').setErrors(errors);
                }

                if ('opcionAuxilioEducativo' in error.errors) {
                    const errors = {};
                    error.errors.opcionAuxilioEducativo.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('opcionAuxilioEducativo').setErrors(errors);
                }

                if ('cantidadHoraSemana' in error.errors) {
                    const errors = {};
                    error.errors.cantidadHoraSemana.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('cantidadHoraSemana').setErrors(errors);
                }

                if ('fechaInicioEstudio' in error.errors) {
                    const errors = {};
                    error.errors.fechaInicioEstudio.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('fechaInicioEstudio').setErrors(errors);
                }

                if ('fechaFinalizacionEstudio' in error.errors) {
                    const errors = {};
                    error.errors.fechaFinalizacionEstudio.forEach(
                        element => {
                            errors[element] = true;
                        }
                    );
                    this.form
                        .get('fechaFinalizacionEstudio').setErrors(errors);
                }

                if ('observacion' in error.errors) {
                    const errors = {};
                    error.errors.observacion.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('observacion').setErrors(errors);
                }

                if ('file' in error.errors) {
                    const errors = {};
                    error.errors.file.forEach(element => {
                        errors[element] = true;
                    });
                    this.form.get('file').setErrors(errors);
                }

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

                if ('snackbarError' in error.errors) {
                    let msg = '';
                    error.errors.snackbarError.forEach(element => {
                        msg = element;
                    });
                    this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: msg,
                        time: 5000
                    });
                }

                if ('snackbarAdvertencia' in error.errors) {
                    let msg = '';
                    error.errors.snackbarAdvertencia.forEach(element => {
                        msg = element;
                    });
                    this._alcanosSnackBar.snackbar({
                        clase: 'advertencia',
                        mensaje: msg,
                        time: 5000
                    });
                }
            }
        });
    }

    /**
     *
     * @param {FormGroup} formGroup
     * @returns {ValidatorFn}
     */
    validateBeneficios(formGroup: FormGroup): ValidatorFn {
        const value = formGroup.value;
        //CA 03 HU061 V1
        if (value.id == null) {
            if (value.fechaSolicitud) {
                const fechaSolicitud = moment(value.fechaSolicitud).toDate();
                const fechaActual = new Date(
                    new Date().setDate(new Date().getDate() - 1)
                );
                formGroup.get('fechaSolicitud').setErrors(null);

                if (fechaSolicitud.getTime() < fechaActual.getTime()) {
                    const errors = {};
                    errors['La fecha que intentas ingresar no debe ser menor que la fecha actual.'] = true;
                    formGroup.get('fechaSolicitud').setErrors(errors);
                }
            }

            if (value.fechaInicioEstudio) {
                const fechaInicioEstudio = moment(
                    value.fechaInicioEstudio
                ).toDate();
                const fechaActual = new Date(
                    new Date().setDate(new Date().getDate() - 1)
                );
                formGroup.get('fechaInicioEstudio').setErrors(null);
                if (fechaInicioEstudio.getTime() < fechaActual.getTime()) {
                    const errors = {};
                    errors[
                        'La fecha de inicio de estudio no debe ser menor que la fecha actual.'
                    ] = true;
                    formGroup.get('fechaInicioEstudio').setErrors(errors);
                }
            }

            if (value.fechaInicioEstudio && value.fechaFinalizacionEstudio) {
                const fechaInicioEstudio = moment(
                    value.fechaInicioEstudio
                ).toDate();
                const fechaFinalizacionEstudio = moment(
                    value.fechaFinalizacionEstudio
                ).toDate();
                formGroup.get('fechaFinalizacionEstudio').setErrors(null);

                if (
                    fechaInicioEstudio.getTime() >=
                    fechaFinalizacionEstudio.getTime()
                ) {
                    const errors = {};
                    errors[
                        'La fecha de finalización no puede ser menor a la fecha de inicio de estudio.'
                    ] = true;
                    formGroup.get('fechaFinalizacionEstudio').setErrors(errors);
                }
            }
        }

        return null;
    }

    displayFn(element: any): string {
        return element ? element.criterioBusqueda : element;
    }

    private _periodicidad(periodicidadId): void {
        this._service.getSubPeriodos(periodicidadId).then((response: any[]) => {
            this.subPeriodos = response;
        });
    }

    private _editarPeriodicidad(beneficioId): void {
        this._service.getBeneficioSubperiodos(beneficioId).then((response: any[]) => {
            const array = [];
            response.map(element => {

                array.push(element.subPeriodoId);
            });
            this.form.patchValue({
                subPeriodoId: array
            });
        });
    }
}
