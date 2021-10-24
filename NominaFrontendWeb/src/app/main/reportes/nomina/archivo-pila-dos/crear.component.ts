import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ArchivoTipo2PilaService } from './crear.service';
import { debounceTime, switchMap } from 'rxjs/operators';
// Chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';
import { reportePila2CodigoTipoPlantilla } from '@alcanos/constantes/reportes-estados';

@Component({
  selector: 'nomina-archivo-tipo-2-pila',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ArchivoTipo2PilaComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  espera: boolean = false;
  disableChip: boolean = true;
  periodoPago: number = null;

  // Chips
  removable = true;
  selectable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  todosFuncionarios: any = [] = [];
  funcionarioOptions: Observable<string[]>;
  filteredPeriodos: Observable<string[]>;
  funcionarios: any = [];

  periodos: any = [];
  tipoPlantillas: any = [];
  tipoCotizantes: any = [];
  subtipoCotizantes: any = [];

  correccionesCodigo = reportePila2CodigoTipoPlantilla;
  planillaFecha: boolean = false;
  planillaNumero: boolean = false;

  @ViewChild('FuncionarioInput', { static: true }) FuncionarioInput: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: ArchivoTipo2PilaService,
  ) {
    this.form = this._formBuilder.group({
      periodoPagoId: [null, [Validators.required]],
      tipoPlanillaId: [null, [Validators.required]],
      numeroPlanilla: [null, [AlcanosValidators.numerico]],
      fechaPagoPlanilla: [null, []],
      tipoCotizanteId: [null, []],
      subtipoCotizante: [null, []],
      funcionario: [null, []],
    });
    //}, { validators: this.validate });
    this.submit = false;

    this._service.getFuncionario().then(resp => {
      this.todosFuncionarios = resp;
    });

    this.funcionarioOptions = this.form.get('funcionario').valueChanges.pipe(
      startWith(null),
      map((funcionario: string | null) => funcionario ? this._filter(funcionario) : this.todosFuncionarios.slice()));

  }

  ngOnInit(): void {

    this.filteredPeriodos = this.form.get('periodoPagoId')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getPeriodos(value))
      );

    this._service.getPeriodoContables().then(resp => {
      this.periodos = resp;
    });

    this._service.getTipoPlantillas().then(resp => {
      this.tipoPlantillas = resp;
    });

    this.form.get('tipoPlanillaId').valueChanges.subscribe(value => {
      if (value != null && value != undefined) {
        this._service.getTipoCotizantes(value).then(resp => {
          this.tipoCotizantes = resp;
        });
      }
    });

    this.form.get('tipoCotizanteId').valueChanges.subscribe(value => {
      if (value != null && value != undefined) {
        this._service.getTipoCotizanteSolo(value).then(resp => {
          this._service.getSubtipoCotizantes(resp.tipoCotizanteId).then(val => {
            this.subtipoCotizantes = val;
          });
        });
      }
    });

    this.form.get('tipoPlanillaId').valueChanges.subscribe(value => {
      if (value != null && value != undefined) {
        this._service.getTipoPlantillaSolo(value).then(resp => {
          if (resp.requiereFechaPagoPlanilla) {
            this.form.get('fechaPagoPlanilla').setValidators([Validators.required]);
            this.form.get('fechaPagoPlanilla').setErrors({ 'required': true });
            this.planillaFecha = true;
          } else {
            this.form.get('fechaPagoPlanilla').clearValidators();
            this.form.get('fechaPagoPlanilla').setErrors(null);
            this.form.get('fechaPagoPlanilla').setValue(null);
            this.planillaFecha = false;
          }

          if (resp.requiereFechaPagoPlanilla) {
            this.form.get('numeroPlanilla').setValidators([Validators.required]);
            this.form.get('numeroPlanilla').setErrors({ 'required': true });
            this.form.get('numeroPlanilla').setValue(null);
            this.planillaNumero = true;
          } else {
            this.form.get('numeroPlanilla').clearValidators();
            this.form.get('numeroPlanilla').setErrors(null);
            this.planillaNumero = false;
          }
        });
      }
    });

  }

  // inicio chips
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
    this.form.get('funcionario').setValue(null);
  }

  remove(funcionario, indx): void {
    this.funcionarios.splice(indx, 1);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.funcionarios.push(event.option.value);
    this.FuncionarioInput.nativeElement.value = '';
    this.form.get('funcionario').setValue(null);
  }

  private _filter(value: any): any {
    // se incluye el filtro como servicio
    this._service.getFuncionarios(value).then(resp => {
      this.todosFuncionarios = resp;
    });
    return this.todosFuncionarios;
  }
  // fin chips



  get periodoPagoId(): AbstractControl {
    return this.form.get('periodoPagoId');
  }
  get tipoPlanillaId(): AbstractControl {
    return this.form.get('tipoPlanillaId');
  }
  get numeroPlanilla(): AbstractControl {
    return this.form.get('numeroPlanilla');
  }
  get fechaPagoPlanilla(): AbstractControl {
    return this.form.get('fechaPagoPlanilla');
  }
  get tipoCotizanteId(): AbstractControl {
    return this.form.get('tipoCotizanteId');
  }
  get subtipoCotizante(): AbstractControl {
    return this.form.get('subtipoCotizante');
  }
  get funcionario(): AbstractControl {
    return this.form.get('funcionario');
  }


  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    this.espera = true;

    // Obtiene funcionarios, transformar array a (string join , )
    const arrayFuncionarios = [];
    if (this.funcionarios != null) {
      this.funcionarios.forEach(element => {
        arrayFuncionarios.push(element.id);
      });
      formValue.funcionario = arrayFuncionarios.join(',');
    }
    // si no existe enviar null
    if (formValue.funcionario === '') {
      formValue.funcionario = null;
    }

    if (formValue.fechaPagoPlanilla != null) {
      formValue.fechaPagoPlanilla = moment(formValue.fechaPagoPlanilla).format('YYYY-MM-DD');
    } else {
      formValue.fechaPagoPlanilla = null;
    }

    if (typeof formValue.subtipoCotizante != 'string') {
      const array2 = [];
      if (formValue.subtipoCotizante != null) {
        formValue.subtipoCotizante.forEach(element => {
          array2.push(element);
        });

        formValue.subtipoCotizante = array2.join(',');
      }
    }

    if (typeof formValue.periodoPagoId === 'object') {
      formValue.periodoPagoId = formValue.periodoPagoId.id;
    }

    this._service.crear(formValue)
      .then((resp) => {
        this.espera = false;
        this.submit = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        // window.open(resp.url + resp.file, 'Archivo a descargar', 'resizable,scrollbars,status');

        fetch(resp.url + resp.file, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', resp.file.replace('/public/', ''));
            //console.log(resp.file.replace('/public/', ''));
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          });

      }).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        this.espera = false;
        let error = resp.error;

        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('periodoPagoId' in error.errors) {
            const errors = {};
            error.errors.periodoPagoId.forEach(element => {
              errors[element] = true;
            });
            this.periodoPagoId.setErrors(errors);
          }

          if ('tipoPlanillaId' in error.errors) {
            const errors = {};
            error.errors.tipoPlanillaId.forEach(element => {
              errors[element] = true;
            });
            this.tipoPlanillaId.setErrors(errors);
          }

          if ('numeroPlanilla' in error.errors) {
            const errors = {};
            error.errors.numeroPlanilla.forEach(element => {
              errors[element] = true;
            });
            this.numeroPlanilla.setErrors(errors);
          }

          if ('tipoCotizanteId' in error.errors) {
            const errors = {};
            error.errors.tipoCotizanteId.forEach(element => {
              errors[element] = true;
            });
            this.tipoCotizanteId.setErrors(errors);
          }

          if ('fechaPagoPlanilla' in error.errors) {
            const errors = {};
            error.errors.fechaPagoPlanilla.forEach(element => {
              errors[element] = true;
            });
            this.fechaPagoPlanilla.setErrors(errors);
          }

          if ('subtipoCotizante' in error.errors) {
            const errors = {};
            error.errors.subtipoCotizante.forEach(element => {
              errors[element] = true;
            });
            this.subtipoCotizante.setErrors(errors);
          }

          if ('funcionario' in error.errors) {
            const errors = {};
            error.errors.funcionario.forEach(element => {
              errors[element] = true;
            });
            this.funcionario.setErrors(errors);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 6000,
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

  displayFnPeriodos(element: any): string {
    return element ? element.nombre : element;
  }


}
