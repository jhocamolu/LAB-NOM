import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { EstadosService } from '../estados.service';
import { SeleccionadosListarService } from '../../seleccionados/listar/listar.service';
import { MostrarService } from '../../mostrar/mostrar.service';

@Component({
  selector: 'modal-estados-descartado',
  templateUrl: './descartado.component.html',
  styleUrls: ['./descartado.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class DescartadoComponent implements OnInit {

  form: FormGroup;
  submit: boolean;

  constructor(
    public dialogRef: MatDialogRef<DescartadoComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: EstadosService,
    private _service2: SeleccionadosListarService,
    private _service3: MostrarService,
  ) {
    this.form = this._formBuilder.group({
      id: [element.id],
      estado: [null, Validators.required],
      justificacion: [null, Validators.required],
    });
  }

  ngOnInit(): void {
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  compareBooleanWith(o1: any, o2: any): boolean {
    return `${o1}` === `${o2}`;
  }

  guardarHandle(event, element): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.estado(this.element.id, formValue)
      .then((resp) => {
        this.dialogRef.close(true);
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        const queryParams = {
          $filter: 'true'
        };
        this._service2.buildFilter(queryParams);
        this._service3.getcandidatos();
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
          if ('estado' in resp.error.errors) {
            const errors = {};
            resp.error.errors.estado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }
          if ('justificacion' in resp.error.errors) {
            const errors = {};
            resp.error.errors.justificacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('justificacion').setErrors(errors);
          }
        }
      });
  }

}
