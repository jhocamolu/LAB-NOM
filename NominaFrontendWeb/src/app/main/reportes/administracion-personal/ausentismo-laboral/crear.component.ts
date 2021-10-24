import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { CrearAusentismoLaboralService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { AlcanosValidators } from '@alcanos/utils';

// chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { reporteEstadoRegistraduria } from '@alcanos/constantes/reportes-estados';


@Component({
    selector: 'ausentismo-laboral-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CrearAusentismoLaboralComponent implements OnInit {
    form: FormGroup;
    submit: boolean;
    getCentroOperativoOptions: any[] = [];
    getDependenciaOptions: any[] = [];
    claseAusentismosOptions: any[];
    tipoAusentismosOptions: any[];

    espera: boolean = false;

    registraduriaConstant = reporteEstadoRegistraduria;

    // Chips
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredCargos: Observable<string[]>;
    cargos: any = [];
    todosCargos: any = [] = [];
    disableChip: boolean = true;

    @ViewChild('CargoInput', { static: true }) CargoInput: ElementRef;

    constructor(
        private _formBuilder: FormBuilder,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router,
        private _service: CrearAusentismoLaboralService
    ) {

        this.claseAusentismosOptions = [];
        this.tipoAusentismosOptions = [];


        this.form = this._formBuilder.group({
            fechaInicial: [null, [Validators.required]],
            fechaFinal: [null, [Validators.required]],
            claseAusentismoId: [null, [Validators.required]],
            tipoAusentismo: [null, []],
            estadoFuncionario: [null, []],
            centroOperativo: [null, []],
            dependencia: [null, []],
            cargo: [null, []],
        }, { validators: this.validate });
        this.submit = false;

        this._service.getCargo().then(resp => {
            this.todosCargos = resp;
        });

        this.filteredCargos = this.form.get('cargo').valueChanges.pipe(
            startWith(null),
            map((cargo: string | null) => cargo ? this._filter(cargo) : this.todosCargos.slice()));
    }

    ngOnInit(): void {

        this._service.getCentroOperativos().then(resp => {
            this.getCentroOperativoOptions = resp;
        });

        this._service.getDependencias().then(resp => {
            this.getDependenciaOptions = resp;
        });

        this._service.getClaseAusentismos().then(resp => {
            this.claseAusentismosOptions = resp;
        });

        this.form.get('claseAusentismoId').valueChanges.subscribe(value => {
            this.form.get('tipoAusentismo').setValue(null);
            if (value != null) {
                this._service.getTipoAusentismos(value).then(
                    (resp) => {
                        this.tipoAusentismosOptions = resp;
                    }
                );
            }
        });


        // this.form.get('dependencia').valueChanges.subscribe(
        //     (value) => {
        //         if (value.length > 0) {
        //             this.disableChip = false;
        //         } else {
        //             this.disableChip = true;
        //             this.cargos = null;
        //         }
        //     }
        // );
    }


    get cargo(): AbstractControl {
        return this.form.get('cargo');
    }

    get centroOperativo(): AbstractControl {
        return this.form.get('centroOperativo');
    }

    get dependencia(): AbstractControl {
        return this.form.get('dependencia');
    }

    get estadoFuncionario(): AbstractControl {
        return this.form.get('estadoFuncionario');
    }

    get tipoAusentismo(): AbstractControl {
        return this.form.get('tipoAusentismo');
    }

    get fechaInicial(): AbstractControl {
        return this.form.get('fechaInicial');
    }

    get fechaFinal(): AbstractControl {
        return this.form.get('fechaFinal');
    }

    // Estructura del objeto desde la documentación no la elimino para que se tome como referencia a una adición desde el filtro general
    // Tener en cuenta que en el html se encuentra igualmente elimnado los objetos que interactuan con esta funcion
    // start chips -> Angular doc https://material.angular.io/components/chips/overview
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add our cargo
        // if ((value || '').trim()) {
        //     this.cargos.push({
        //         id: Math.random(),
        //         nombre: value.trim()
        //     });
        // }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.form.get('cargo').setValue(null);
    }

    remove(cargo, indx): void {
        this.cargos.splice(indx, 1);
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.cargos.push(event.option.value);
        this.CargoInput.nativeElement.value = '';
        this.form.get('cargo').setValue(null);
    }

    private _filter(value: any): any {
        // se incluye el filtro como servicio
        this._service.getSoloCargo(value).then(resp => {
            this.todosCargos = resp;
        });
        return this.todosCargos;
    }

    // end chips



    guardarHandle(event): void {
        const formValue = this.form.value;
        this.submit = false;
        const array = [];

        if (formValue.centroOperativo != null) {
            if (typeof formValue.centroOperativo != 'string') {
                if (formValue.centroOperativo == "") {
                    formValue.centroOperativo = null;
                } else {
                    formValue.centroOperativo = formValue.centroOperativo.join(',');
                }
            }
        }

        if (formValue.dependencia != null) {
            if (typeof formValue.dependencia != 'string') {
                if (formValue.dependencia == "") {
                    formValue.dependencia = null;
                } else {
                    formValue.dependencia = formValue.dependencia.join(',');
                }
            }
        }

        if (formValue.estadoFuncionario != null) {
            if (typeof formValue.estadoFuncionario != 'string') {
                if (formValue.estadoFuncionario == "") {
                    formValue.estadoFuncionario = null;
                } else {
                    formValue.estadoFuncionario = formValue.estadoFuncionario.join(',');
                }
            }
        }

        
        if (formValue.tipoAusentismo != null) {
            if (typeof formValue.tipoAusentismo != 'string') {
                if (formValue.tipoAusentismo == "") {
                    formValue.tipoAusentismo = null;
                } else {
                    formValue.tipoAusentismo = formValue.tipoAusentismo.join(',');
                }
            }
        }

        

        if (this.cargos != null) {
            this.cargos.forEach(element => {
                array.push(element.id);
            });

            formValue.cargo = array.join(',');
        }

        if (formValue.cargo === '') {
            formValue.cargo = null;
        }

        this.espera = true;
        this.submit = true;

        this._service.crear(formValue)
            .then((resp) => {
                this.espera = false;
                this.submit = false;

                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                window.open(resp.url + resp.file, "_blank");
            }
            ).catch((resp: HttpErrorResponse) => {
                this.submit = false;
                let error = resp.error;
                if (typeof resp.error === 'string') {
                    error = JSON.parse(resp.error);
                } else {
                    error = resp.error;
                }
                if (resp.status === 400) {
                    if ('estadoFuncionario' in error) {
                        const errores = {};
                        error.estadoFuncionario.forEach(element => {
                            errores[element] = true;
                        });
                        this.estadoFuncionario.setErrors(errores);
                    }

                    if ('centroOperativo' in error) {
                        const errores = {};
                        error.centroOperativo.forEach(element => {
                            errores[element] = true;
                        });
                        this.centroOperativo.setErrors(errores);
                    }

                    if ('dependencia' in error) {
                        const errores = {};
                        error.dependencia.forEach(element => {
                            errores[element] = true;
                        });
                        this.dependencia.setErrors(errores);
                    }

                    if ('cargo' in error) {
                        const errores = {};
                        error.cargo.forEach(element => {
                            errores[element] = true;
                        });
                        this.cargo.setErrors(errores);
                    }

                    if ('tipoAusentismo' in error) {
                        const errores = {};
                        error.tipoAusentismo.forEach(element => {
                            errores[element] = true;
                        });
                        this.tipoAusentismo.setErrors(errores);
                    }

                    if ('fechaInicial' in error) {
                        const errores = {};
                        error.fechaInicial.forEach(element => {
                            errores[element] = true;
                        });
                        this.fechaInicial.setErrors(errores);
                    }

                    if ('fechaFinal' in error) {
                        const errores = {};
                        error.fechaFinal.forEach(element => {
                            errores[element] = true;
                        });
                        this.fechaFinal.setErrors(errores);
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
                }
            });

    }

      /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;


    if (value.id == null && value.fechaInicial != null) {
      formGroup.get('fechaInicial').setErrors(null);
      let fechaInicial = value.fechaInicial;
      if (typeof fechaInicial === 'string') {
        fechaInicial = moment(fechaInicial).toDate();
      } else {
        fechaInicial = value.fechaInicial.toDate();
      }
      //
      const actual = moment().toDate();
      actual.setHours(0);
      actual.setMinutes(0);
      actual.setSeconds(0);
      actual.setMilliseconds(0);
      if (fechaInicial.getTime() == actual.getTime()) {
        const errors = {};
        errors['La fecha inicial no puede ser igual a la fecha actual.'] = true;
        formGroup.get('fechaInicial').setErrors(errors);
      }

      if (fechaInicial.getTime() > moment().toDate().getTime()) {
        const errors = {};
        errors['La fecha inicial no puede ser posterior a la fecha actual.'] = true;
        formGroup.get('fechaInicial').setErrors(errors);
      }

      // if (fechaInicial.getTime() < moment().subtract(1, 'day').toDate().getTime()) {
      //   const errors = {};
      //   errors['La fecha inicial no puede ser posterior a la fecha actual.'] = true;
      //   formGroup.get('fechaInicial').setErrors(errors);
      // }

    }

    if (value.fechaInicial != null && value.fechaFinal != null) {
      formGroup.get('fechaFinal').setErrors(null);

      let fechaInicial = value.fechaInicial;
      let fechaFinal = value.fechaFinal;

      if (typeof fechaInicial === 'string') {
        fechaInicial = moment(fechaInicial).toDate();
      } else {
        fechaInicial = value.fechaInicial.toDate();
      }

      if (typeof fechaFinal === 'string') {
        fechaFinal = moment(fechaFinal).toDate();
      } else {
        fechaFinal = value.fechaFinal.toDate();
      }
      //
      if (fechaFinal.getTime() > moment().toDate().getTime()) {
        const errors = {};
        errors['La fecha final no puede ser posterior a la fecha actual.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }
      // if (fechaFinal.getTime() < moment().subtract(1, 'day').toDate().getTime()) {
      //   const errors = {};
      //   errors['La fecha final no puede ser posterior a la fecha actual.'] = true;
      //   formGroup.get('fechaFinal').setErrors(errors);
      // }

      if (fechaFinal.getTime() == fechaInicial.getTime()) {
        const errors = {};
        errors['La fecha final no puede ser igual a la fecha inicial.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

      if (fechaFinal.getTime() < fechaInicial.getTime()) {
        const errors = {};
        errors['La fecha final no puede ser anterior a la fecha inicial.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

    }

    return null;
  }

}
