import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { InformacionBasicaService } from './informacion-basica.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import * as moment from 'moment';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'liquidacion-nomina-informacion-basica',
  templateUrl: './informacion-basica.component.html',
  styleUrls: ['./informacion-basica.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class InformacionBasicaComponent implements OnInit {

  arrayPermisosFuncionarios: any;

  estadoNomina = estadoNominaAlcanos;
  item: any;
  periodo: any;

  form: FormGroup;
  isDisabled = false;
  submit: boolean;
  newEstado: any; 
  tipoLiquidacionOptions: any[];
  subperiodoOptions: any[];

  fechaInicial: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: InformacionBasicaService,
    private _permisos: PermisosrService,
  ) {
    this.newEstado = {estado: null};
    this.periodo = this._service.onPeriodoChanged.value;
    this.tipoLiquidacionOptions = [];
    this.subperiodoOptions = [];
    this.form = this._formBuilder.group({
      id: [null],
      tipoLiquidacionId: [null, [Validators.required]],
      subperiodoId: [null, [Validators.required]],
      fechaInicio: [null, []],
      fechaFinal: [null, []],
    }, { validator: this.validateFechas });
    this.submit = false;
    
    
    this.arrayPermisosFuncionarios = this._permisos.permisosStorage('NominaFuncionarios_', null, null, 'NominaFuncionarios_Iniciar', null, null, null, null);
  }

  ngOnInit(): void {
    
    this._desabilitarFechas(true);
    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;
        this._service.getIdNomina(this.item.id).then(respo => {
          this.newEstado = respo; 
        });
        this.form.patchValue(this.item);
        this.form.markAllAsTouched();
        this._selectSubperiodos(this.item.tipoLiquidacion.tipoPeriodoId);
        if (this.item.estado !== this.estadoNomina.inicializada) {
          this.form.disable();
          this.isDisabled = true;
        }
        this._desabilitarFechas(!this.item.tipoLiquidacion.fechaManual);
      }
    });

    this._selectTipoLiquidacion();
    this.form.get('tipoLiquidacionId').valueChanges.subscribe(value => {
      const tipoLiquidacion = this._getItem(this.tipoLiquidacionOptions, value);
      this._desabilitarFechas(!tipoLiquidacion.fechaManual);
      this.form.get('subperiodoId').setValue(null);
      if (tipoLiquidacion && tipoLiquidacion.tipoPeriodoId) {
        this._selectSubperiodos(tipoLiquidacion.tipoPeriodoId);
      }
    });
  }

  // tslint:disable-next-line: typedef
  private _desabilitarFechas(desabilitar) {
    if (desabilitar) {
      this.form.get('fechaFinal').disable();
      this.form.get('fechaInicio').disable();
    } else {
      this.form.get('fechaFinal').enable();
      this.form.get('fechaInicio').enable();
    }

  }
  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validateFechas(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    if (value.fechaInicio && value.fechaFinal) {
      formGroup.get('fechaFinal').setErrors(null);
      let fechaInicio = value.fechaInicio;
      let fechaFinal = value.fechaFinal;
      if (typeof fechaInicio === 'string') {
        fechaInicio = new Date(fechaInicio);
      } else {
        fechaInicio = value.fechaInicio.toDate();
      }

      if (typeof fechaFinal === 'string') {
        fechaFinal = new Date(fechaFinal);
      } else {
        fechaFinal = value.fechaFinal.toDate();
      }


      if (fechaInicio.getTime() > fechaFinal.getTime()) {
        const errors = {};
        errors['La fecha de finalización no debe ser menor a la fecha de inicio.'] = true;
        formGroup.get('fechaFinal').setErrors(errors);
      }

    }

    return null;
  }



  private _selectTipoLiquidacion(): void {
    this._service.getTipoLiquidaciones().then(
      (resp: any[]) => {
        this.tipoLiquidacionOptions = resp;
      }
    );
  }

  private _selectSubperiodos(tipoPeriodoId: number): void {
    this.subperiodoOptions = [];
    this._service.getSubperiodos(tipoPeriodoId).then(
      (resp: any[]) => {
        this.subperiodoOptions = resp;
      }
    );
  }

  private _getItem(array: any[], id: number): any {
    let item = null;
    array.forEach(element => {
      if (element.id == id) {
        item = element;
        return;
      }
    });
    return item;
  }

  private get _subperiodoSeleted(): any | null {
    let subperiodo = null;
    this.subperiodoOptions.forEach(element => {
      if (this.form.get('subperiodoId').value && element.id == this.form.get('subperiodoId').value) {
        subperiodo = element;
      }
    });
    return subperiodo;
  }


  get fechaInicio(): Date | null {
    const subperiodo = this._subperiodoSeleted;
    if (subperiodo && this.periodo) {
      const fecha = new Date(this.periodo.fecha);
      // se intercambia el elemento day según el subperiodo diaInicial #A
      fecha.setDate(subperiodo.diaInicial);

      return fecha;
    }
    return null;
  }

  /************************
   * 
   * ** get fechaFin() -> CONTENIDO RELACIONAL CON EL BACKEND -> SE UTILIZA LA MISMA ESTRUCTURA -- no borrar para efecto de documentación
   * 
   * 
   * public static dynamic CalculaFechaFinalLiquidacionNomina(DateTime fechaPeriodoContable, int dias, int diaInicio)
    {
        try
        {
            DateTime fechaInicio = FechaLiquidacionNomina.CalculaFechaInicioLiquidacionNomina(fechaPeriodoContable, diaInicio);
            DateTime sumaDiasfechaFinal = fechaInicio.AddDays(dias);

            DateTime fechaFinal = DateTime.MinValue;
            if (sumaDiasfechaFinal.AddDays(-1) < fechaPeriodoContable.AddDays(-1))
            {
                fechaFinal = sumaDiasfechaFinal.AddDays(-1);
            }
            else if (sumaDiasfechaFinal.AddDays(-1) >= fechaPeriodoContable.AddDays(-1))
            {
                fechaFinal = fechaPeriodoContable;
            }
            return fechaFinal;
        }
        catch (Exception e)
        {
            return e.Message;
        }
    }
   * 
   * 
   ************************/

  get fechaFin(): Date | null {
    let fecha;
    const subperiodo = this._subperiodoSeleted;

    if (subperiodo && this.periodo) {
      let fechaCalculada;
      let fechaPeriodoContable: any = null;
      fecha = new Date(this.periodo.fecha);

      // Validación se suma -1 a la fecha del periodo contable
      fechaPeriodoContable = fecha.setDate(fecha.getDate() - 1);
      // Se trae la fecha de Inicio tal cual el getter fechaInicio; #A
      fechaCalculada = new Date(fecha.setDate(subperiodo.diaInicial));
      
      // A la fecha inicial de liquidación se le suma  el valor obtenido de la operación de sumar el día de 
      // inicio y la cantidad de días menos 1  día para obtener la fecha final. 
      fecha = fechaCalculada.setDate((fechaCalculada.getDate() + (subperiodo.dias)) - 1);

      // Si la fecha final  es menor que la fecha de finalización del periodo contable menos 1 día, Se debe mostrar 
      // como fecha final de liquidación la fecha final.
      if (fecha < fechaPeriodoContable) {
        return fecha;
      // Si la  fecha final es mayor o igual que la fecha de finalización del periodo contable menos 1 día,
      // Se debe mostrar como fecha final de liquidación la fecha final del periodo contable.

      } else if (fecha >= fechaPeriodoContable) {
        fecha = new Date(this.periodo.fecha);
        return fecha;
      }
    }

    return null;
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    formValue.fechaInicio = moment(formValue.fechaInicio).format('YYYY-MM-DDTHH:mm:ssZ');
    formValue.fechaFinal = moment(formValue.fechaFinal).format('YYYY-MM-DDTHH:mm:ssZ');
    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/nomina/liquidacion-nomina/${resp.id}/asignacion`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        this._alcanosSnackBar.snackbar({
          mensaje: resp.status === 404 ? resp.error.message : null,
          clase: 'error',
          time: 5000
        });
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in error) {
          if ('snack' in error.errors) {
            const errors = {};
            error.errors.snack.forEach(element => {
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: element,
                time: 6000
              });
            });
          }
          if ('tipoLiquidacion' in error.errors) {
            const errors = {};
            error.errors.tipoLiquidacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('tipoLiquidacion').setErrors(errors);
          }

          if ('subperiodo' in error.errors) {
            const errors = {};
            error.errors.subperiodo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('subperiodo').setErrors(errors);
          }
          if ('fechaInicio' in error.errors) {
            const errors = {};
            error.errors.fechaInicio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicio').setErrors(errors);
          }
          if ('fechaFinal' in error.errors) {
            const errors = {};
            error.errors.fechaFinal.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFinal').setErrors(errors);
          }

        }

      });
  }


}

