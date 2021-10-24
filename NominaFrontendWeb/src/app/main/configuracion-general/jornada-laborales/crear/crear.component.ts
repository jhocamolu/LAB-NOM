import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { CrearService } from './crear.service';
import { Router } from '@angular/router';
import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'jornada-laborales-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  form: FormGroup;
  submit: boolean;
  item: any;

  id: number;


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: CrearService,
  ) {

    this.form = this._formBuilder.group({
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(100)]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  salirHandle(event): void {
    this._router.navigate(
      ['/configuracion/jornada-laborales'],
    );
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/configuracion/jornada-laborales/${resp.id}/editar`], { queryParams: { tab: 1 } });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('codigo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.codigo.forEach(element => {
              errors[element] = true;
            });
            this.codigo.setErrors(errors);
          }

          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }
        }
      });

  }

}
