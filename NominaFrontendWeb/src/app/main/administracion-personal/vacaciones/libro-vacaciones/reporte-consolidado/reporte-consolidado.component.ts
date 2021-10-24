import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosValidators } from '@alcanos/utils';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoContratoReportesAlcanos } from '@alcanos/constantes/contratos';
import { periodosAlcanos } from '@alcanos/constantes/periodos';
import { ReporteConsolidadoService } from './reporte-consolidado.service';

@Component({
  selector: 'libro-vacaciones-reporte-consolidado',
  templateUrl: './reporte-consolidado.component.html',
  styleUrls: ['./reporte-consolidado.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReporteConsolidadoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  espera: boolean = false;

  estadocontrato = estadoContratoReportesAlcanos;
  periodos = periodosAlcanos;

  centroOperativos: any[];
  dependencias: any[];

  constructor(
    public dialogRef: MatDialogRef<ReporteConsolidadoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: ReporteConsolidadoService
  ) {
    this.submit = false;
    this.form = this._formBuilder.group({
      periodo: [null, [Validators.required]],
      estadoContrato: [null, [Validators.required]],
      dependenciaId: [null, []],
      centroOperativoId: [null, []],
    });
  }

  ngOnInit(): void {
    this.selectCentroOperativo();
    this.selectDependencia();
  }

  public selectCentroOperativo(): void {
    this.centroOperativos = [];
    this._service.getCentroOperativosLista().then(
      (resp: any[]) => {
        this.centroOperativos = resp;
      }
    );
  }

  public selectDependencia(): void {
    this.dependencias = [];
    this._service.getDependenciasLista().then(
      (resp: any[]) => {
        this.dependencias = resp;
      }
    );
  }


  get Periodo(): AbstractControl {
    return this.form.get('Periodo');
  }
  get EstadoContrato(): AbstractControl {
    return this.form.get('EstadoContrato');
  }
  get DependenciaId(): AbstractControl {
    return this.form.get('DependenciaId');
  }
  get CentroOperativoId(): AbstractControl {
    return this.form.get('CentroOperativoId');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = false;
    const arrayPeriodos = [];
    if (formValue.periodo != null) {
      formValue.periodo.forEach(element => {
        arrayPeriodos.push(element);
      });

      formValue.periodo = arrayPeriodos.join(',');
    }

    const arrayEstadoContrato = [];
    if (formValue.estadoContrato != null) {
      formValue.estadoContrato.forEach(element => {
        arrayEstadoContrato.push(element);
      });

      formValue.estadoContrato = arrayEstadoContrato.join(',');
    }

    const arrayCentroOperativo = [];
    if (formValue.centroOperativoId != null) {
      formValue.centroOperativoId.forEach(element => {
        arrayCentroOperativo.push(element);
      });

      formValue.centroOperativoId = arrayCentroOperativo.join(',');
    }

    const arrayDependencia = [];
    if (formValue.dependenciaId != null) {
      formValue.dependenciaId.forEach(element => {
        arrayDependencia.push(element);
      });

      formValue.dependenciaId = arrayDependencia.join(',');
    }
    this.espera = true;
    this.submit = true;
    this._service.crear(formValue)
      .then((resp) => {
        this.espera = false;
        this.submit = false;
        this.dialogRef.close(true);
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
          if ('Periodo' in error.errors) {
            const errors = {};
            error.errors.Periodo.forEach(element => {
              errors['Error'] = true;
            });
            this.Periodo.setErrors(errors);
          }
          if ('EstadoContrato' in error.errors) {
            const errors = {};
            error.errors.EstadoContrato.forEach(element => {
              errors[element] = true;
            });
            this.EstadoContrato.setErrors(errors);
          }
          if ('DependenciaId' in error.errors) {
            const errors = {};
            error.errors.DependenciaId.forEach(element => {
              errors[element] = true;
            });
            this.DependenciaId.setErrors(errors);
          }
          if ('CentroOperativoId' in error.errors) {
            const errors = {};
            error.errors.CentroOperativoId.forEach(element => {
              errors[element] = true;
            });
            this.CentroOperativoId.setErrors(errors);
          }

          if ('snack' in error.errors) {
            let msg = '';
            error.errors.snack.forEach(element => {
              msg = element;
            });
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: msg,
              time: 7000,
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
