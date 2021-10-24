import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'tipo-periodos-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  item: any;
  form: FormGroup;
  submit: boolean;
  id: number;


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: CrearService
  ) {

    this.form = this._formBuilder.group({
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      pagoPorDefecto: [null],
    });
    this.submit = false;
  }

  ngOnInit(): void {
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get pagoPorDefecto(): AbstractControl {
    return this.form.get('pagoPorDefecto');
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/configuracion/tipo-periodos/${resp.id}/editar`], { queryParams: { tab: 1 } });
      }
      ).catch((resp: HttpErrorResponse) => {
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        this.submit = false;
        if (resp.status === 400 && 'errors' in error) {
          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            this.nombre.setErrors(errores);
          }
          if ('pagoPorDefecto' in error.errors) {
            const errores = {};
            error.errors.pagoPorDefecto.forEach(element => {
              errores[element] = true;
            });
            this.pagoPorDefecto.setErrors(errores);
          }
        }
      });

  }

}
