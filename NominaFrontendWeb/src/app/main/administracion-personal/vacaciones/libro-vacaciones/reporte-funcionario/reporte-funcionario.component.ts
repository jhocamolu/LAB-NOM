import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { periodosAlcanos } from '@alcanos/constantes/periodos';
import { ReporteConsolidadoService } from '../reporte-consolidado/reporte-consolidado.service';

@Component({
  selector: 'libro-vacaciones-reporte-funcionario',
  templateUrl: './reporte-funcionario.component.html',
  styleUrls: ['./reporte-funcionario.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReporteFuncionarioComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  espera: boolean = false;
  funcionario: any;
  periodos = periodosAlcanos;

  constructor(
    public dialogRef: MatDialogRef<ReporteFuncionarioComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: ReporteConsolidadoService
  ) {
    this.submit = false;
    this.form = this._formBuilder.group({
      periodo: [null],
    });
  }

  ngOnInit(): void {
    this._service.getFuncionarios(this.element.numeroDocumento).then(resp => {
      if (resp.length > 0) {
        this.funcionario = resp[0];
      } else {
        this.form.get('periodo').setErrors({ 'El funcionario no se encuentra activo': true });
      }
    });
  }

  get Periodo(): AbstractControl {
    return this.form.get('Periodo');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = false;
    const formValue = this.form.value;
    formValue.funcionarioId = this.funcionario.id;

    const arrayPeriodos = [];
    if (formValue.periodo != null) {
      formValue.periodo.forEach(element => {
        arrayPeriodos.push(element);
      });

      formValue.periodo = arrayPeriodos.join(',');
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
        }

      });
  }

}
