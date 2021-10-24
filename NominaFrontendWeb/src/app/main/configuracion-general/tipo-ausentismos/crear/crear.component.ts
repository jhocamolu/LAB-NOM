import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CrearService } from './crear.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosValidators } from '@alcanos/utils';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'tipo-ausentismos-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CrearComponent implements OnInit {

  item: any;
  form: FormGroup;
  submit: boolean;
  claseOptions: any[] = [];
  id: number;

  selectedTab: number;


  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: CrearService
  ) {
    this.form = this._formBuilder.group({
      id: [null],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      claseAusentismoId: [null],
      unidadTiempo: [null, [Validators.required]],
    });
    this.submit = false;
  }

  ngOnInit(): void {
    this.selectClase();
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  public selectClase(): void {
    this._service.getClaseLista().then(
      (resp: any[]) => {
        this.claseOptions = resp;
      }
    );
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get claseAusentismoId(): AbstractControl {
    return this.form.get('claseAusentismoId');
  }
  get unidadTiempo(): AbstractControl {
    return this.form.get('unidadTiempo');
  }


  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;
    this._service.crear(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this._router.navigate([`/configuracion/tipo-ausentismos/${resp.id}/editar`], { queryParams: { tab: 1 } });
      }
      ).catch((resp: HttpErrorResponse) => {
        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }
        if (resp.status === 400 && 'errors' in resp.error) {
          if ('nombre' in resp.error.errors) {
            const errors = {};
            resp.error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.nombre.setErrors(errors);
          }
          if ('claseAusentismoId' in resp.error.errors) {
            const errors = {};
            resp.error.errors.claseAusentismoId.forEach(element => {
              errors[element] = true;
            });
            this.claseAusentismoId.setErrors(errors);
          }

          if ('unidadTiempo' in resp.error.errors) {
            const errors = {};
            resp.error.errors.unidadTiempo.forEach(element => {
              errors[element] = true;
            });
            this.unidadTiempo.setErrors(errors);
          }

        }
      });
  }
}
