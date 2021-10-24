import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { LiquidacionFormService } from './liquidacion-form.service';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { tipoLiquidacionAlcanos } from '@alcanos/constantes/tipo-liquidacion';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { OperacionTotal, NovedadLiquidar } from '@alcanos/constantes/tipo-liquidacion';

@Component({
  selector: 'liquidaciones-liquidacion-form',
  templateUrl: './liquidacion-form.component.html',
  styleUrls: ['./liquidacion-form.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class LiquidacionFormComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  item: any;

  tipoPeriodosOptions: any[] = [];
  id: number;
  tipoLiquidacion = tipoLiquidacionAlcanos;
  //
  conceptoNominaOptions: Observable<string[]>;
  operacionesTotales: any = OperacionTotal;
  novedadesLiquidar: any = NovedadLiquidar;

  @ViewChild('ConceptoInput', { static: true }) ConceptoInput: ElementRef;


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: LiquidacionFormService,
  ) {

    this.form = this._formBuilder.group({
      id: [null],
      codigo: [null, [Validators.required, AlcanosValidators.alfanumerico, AlcanosValidators.maxLength(20)]],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(60)]],
      tipoPeriodoId: [null, [Validators.required]],
      fechaManual: [null, [Validators.required]],
      descripcion: [null, [AlcanosValidators.maxLength(300)]],
      proceso: [null, [Validators.required]],
      contabiliza: [null, [Validators.required]],
      aplicaPila: [null, [Validators.required]],
      conceptoNominaAgrupadorId: [null, [Validators.required]],
      operacionTotal: [null, [Validators.required]],
      ListaTipoLiquidacionModulos: [null, []]
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectTipoPeriodos();
    this.conceptoNominaOptions = this.form.get('conceptoNominaAgrupadorId')
      .valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this._service.getConceptos(value))
      );

    this.form.patchValue({
      aplicaPila: false,
    });
  }


  public selectTipoPeriodos(): void {
    this._service.getTipoPeriodos().then(
      (resp: any[]) => {
        this.tipoPeriodosOptions = resp;
      }
    );
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    if (formValue.conceptoNominaAgrupadorId != null) {
      formValue.conceptoNominaAgrupadorId = formValue.conceptoNominaAgrupadorId.id;
    }


    if (formValue.ListaTipoLiquidacionModulos != null) {
      const tipoLiquidacionesA = [];
      formValue.ListaTipoLiquidacionModulos.map(element => {
        tipoLiquidacionesA.push({
          'Modulo': element
        });
      });
      formValue.ListaTipoLiquidacionModulos = tipoLiquidacionesA;
    }

    this._service.crear(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/nomina/tipo-liquidaciones/${resp.id}/editar`], { queryParams: { tab: 1 } });
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
          if ('codigo' in error.errors) {
            const errors = {};
            error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('codigo').setErrors(errors);
          }

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }

          if ('tipoPeriodo' in error.errors) {
            const errors = {};
            error.errors.tipoPeriodo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoPeriodo').setErrors(errors);
          }

          if ('fechaManual' in error.errors) {
            const errors = {};
            error.errors.fechaManual.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaManual').setErrors(errors);
          }

          if ('descripcion' in error.errors) {
            const errors = {};
            error.errors.descripcion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('descripcion').setErrors(errors);
          }

          if ('proceso' in error.errors) {
            const errors = {};
            error.errors.proceso.forEach(element => {
              errors[element] = true;
            });
            this.form.get('proceso').setErrors(errors);
          }

          if ('contabiliza' in error.errors) {
            const errors = {};
            error.errors.contabiliza.forEach(element => {
              errors[element] = true;
            });
            this.form.get('contabiliza').setErrors(errors);
          }

          if ('aplicaPila' in error.errors) {
            const errors = {};
            error.errors.aplicaPila.forEach(element => {
              errors[element] = true;
            });
            this.form.get('aplicaPila').setErrors(errors);
          }

          if ('conceptoNominaAgrupadorId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaAgrupadorId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaAgrupadorId').setErrors(errors);
          }

          if ('operacionTotal' in error.errors) {
            const errors = {};
            error.errors.operacionTotal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('operacionTotal').setErrors(errors);
          }

          if ('ListaTipoLiquidacionModulos' in error.errors) {
            const errors = {};
            error.errors.ListaTipoLiquidacionModulos.forEach(element => {
              errors[element] = true;
            });
            this.form.get('ListaTipoLiquidacionModulos').setErrors(errors);
          }

        }

      });
  }

  displayFnConceptos(element: any): string {
    return element ? `${element.codigo}, ${element.nombre}` : element;
  }

}
