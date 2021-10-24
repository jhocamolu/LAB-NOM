import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ConsolidadoService } from './consolidado.service';
import { debounceTime, switchMap } from 'rxjs/operators';
// Chips
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'nomina-consolidado',
  templateUrl: './consolidado.component.html',
  styleUrls: ['./consolidado.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ConsolidadoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  espera: boolean = false;
  disableChip: boolean = true;
  // Chips
  removable = true;
  selectable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  todosConceptos: any = [] = [];
  conceptoNominaOptions: Observable<string[]>;
  conceptos: any = [];

  @ViewChild('ConceptoInput', { static: true }) ConceptoInput: ElementRef;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: ConsolidadoService,
  ) {
    this.form = this._formBuilder.group({
      fechaInicial: [null, [Validators.required]],
      fechaFinal: [null, [Validators.required]],
      concepto: [null, []],
    }, { validators: this.validate });
    this.submit = false;

    this._service.getConcepto().then(resp => {
      this.todosConceptos = resp;
    });

    this.conceptoNominaOptions = this.form.get('concepto').valueChanges.pipe(
      startWith(null),
      map((concepto: string | null) => concepto ? this._filter(concepto) : this.todosConceptos.slice()));
  }

  ngOnInit(): void {
  }

  // public selectConceptoNomina(): void {
  // }

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
    this.form.get('concepto').setValue(null);
  }

  remove(concepto, indx): void {
    this.conceptos.splice(indx, 1);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.conceptos.push(event.option.value);
    this.ConceptoInput.nativeElement.value = '';
    this.form.get('concepto').setValue(null);
  }

  private _filter(value: any): any {
    // se incluye el filtro como servicio
    this._service.getSoloConcepto(value).then(resp => {
      this.todosConceptos = resp;
    });
    return this.todosConceptos;
  }
  // fin chips


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

  get fechaInicial(): AbstractControl {
    return this.form.get('fechaInicial');
  }
  get fechaFinal(): AbstractControl {
    return this.form.get('fechaFinal');
  }
  get concepto(): AbstractControl {
    return this.form.get('concepto');
  }


  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = false;

    const arrayConceptos = [];
    if (this.conceptos != null) {
      this.conceptos.forEach(element => {
        arrayConceptos.push(element.id);
      });

      formValue.conceptoNominaId = arrayConceptos.join(',');
    }
    formValue.fechaInicial = moment(formValue.fechaInicial).format('YYYY-MM-DD');
    formValue.fechaFinal = moment(formValue.fechaFinal).format('YYYY-MM-DD');
    if (formValue.concepto === '') {
      formValue.concepto = null;
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
        if (resp.status === 400 && 'errors' in error) {
          if ('fechaInicial' in error.errors) {
            const errors = {};
            error.errors.fechaInicial.forEach(element => {
              errors[element] = true;
            });
            this.fechaInicial.setErrors(errors);
          }
          if ('fechaFinal' in error.errors) {
            const errors = {};
            error.errors.fechaFinal.forEach(element => {
              errors[element] = true;
            });
            this.fechaFinal.setErrors(errors);
          }
          if ('concepto' in error.errors) {
            const errors = {};
            error.errors.concepto.forEach(element => {
              errors[element] = true;
            });
            this.concepto.setErrors(errors);
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


}
