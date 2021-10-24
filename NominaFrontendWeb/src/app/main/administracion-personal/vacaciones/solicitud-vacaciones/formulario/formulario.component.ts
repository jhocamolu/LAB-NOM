import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FormularioService } from './formulario.service';
import { HttpErrorResponse } from '@angular/common/http';

import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ListarService } from '../listar/listar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'solicitud-vacaciones-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FormularioComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  submit: boolean;
  item: any;
  id: number;
  funcionarios: any;
  //
  periodosOptions: any[];

  desabilitar: boolean = false;

  selectedTab = 0;
  filteredFuncionarios: Observable<string[]>;
  libroVacaciones: any;
  //
  interrupciones: any[];
  interrupcionesCount: any;
  arrayPermisos: any;
  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _service: FormularioService,
    private _permisos: PermisosrService
  ) {
    this.item = null;
    this.arrayPermisos = this._permisos.permisosStorage('SolicitudVacacionesInterrupciones_')
    this.periodosOptions = [];
    this.selectedTab = this._service.selectedTab;
    this.form = this._formBuilder.group({
      id: [null],
      funcionario: [null, [Validators.required]],
      fechaInicioDisfrute: [null, [Validators.required]],
      diasDisfrute: [null, [Validators.required, Validators.min(0), Validators.max(99)]],
      diasDinero: [null, [Validators.required, Validators.max(99)]],
      observacion: [null, [Validators.required]],
    }, { validators: this.validate });
    this.submit = false;
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(resp => {
      if (resp != null) {
        this.item = resp;

        this.desabilitar = true;

        this._service._getInterrupciones().then(resp => {
          this.interrupciones = resp.value;
          this.interrupcionesCount = resp['@odata.count'];
        });

        this.form.patchValue({
          id: this.item.id,
          funcionario: this.item.funcionario,
          fechaInicioDisfrute: this.item.fechaInicioDisfrute,
          diasDisfrute: this.item.diasDisfrute,
          diasDinero: this.item.diasDinero,
          observacion: this.item.observacion,
        });
        this.funcionarios = null;
        // Desabilitar campos en el editar
        this.form.get('funcionario').disable();
        // habilitar campo en el editar
      }
    });

    this.form.get('fechaInicioDisfrute').valueChanges.subscribe(value => {
      if (this.item != null) {

        let fechaInicioDisfrute = value;
        if (typeof fechaInicioDisfrute === 'string') {
          fechaInicioDisfrute = moment(fechaInicioDisfrute);
        } else {
          fechaInicioDisfrute = value;
        }

        const totalDiasMes = moment().format("YYYY-MM-01");

         /// Solicitud bloqueda por analista y qa para efecto de cargue masivo de contenidos a espera de modificación
        // if (moment(totalDiasMes).toDate().getTime() > fechaInicioDisfrute.toDate().getTime()) {
        //   const errors = {};
        //   errors['La fecha de inicio no puede ser ser diferente al mes en curso o inferior.'] = true;
        //   this.form.get('fechaInicioDisfrute').setErrors(errors);
        // }

      }
    });


    this.filteredFuncionarios = this.form.get('funcionario')
      .valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this._service.getFuncionarios(value))
      );

    this.form.get('funcionario')
      .valueChanges.subscribe(value => {

        if (typeof value == 'object' && this.item == null) {
          if (this.funcionarios != null) {
            if (this.funcionarios.id != value.id) {
              this.form.get('fechaInicioDisfrute').setValue(null);
              this.form.get('diasDisfrute').setValue(null);
              this.form.get('diasDinero').setValue(null);
              this.form.get('observacion').setValue(null);
              this.funcionarios = value;
            }
          } else {
            this.funcionarios = value;
          }
        }
        this._getPeriodos();
      });

  }

  ngAfterViewInit(): void {
  }


  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }


  get seletedFuncionario(): boolean {
    const value = this.form.get('funcionario').value;
    if (value != null && typeof value === 'object') {
      return true;
    }
    return false;
  }

  /**
   * 
   * @param {FormGroup} formGroup
   * @returns {ValidatorFn}
   */
  validate(formGroup: FormGroup): ValidatorFn {
    const value = formGroup.value;

    let fechaInicioDisfrute = value.fechaInicioDisfrute;
    if (typeof fechaInicioDisfrute === 'string') {
      fechaInicioDisfrute = moment(fechaInicioDisfrute);
    } else {
      fechaInicioDisfrute = value.fechaInicioDisfrute;
    }

    if (value.id == null) {
      if (value.fechaInicioDisfrute != null) {
        const totalDiasMes = moment().format("YYYY-MM-01");

         /// Solicitud bloqueda por analista y qa para efecto de cargue masivo de contenidos a espera de modificación
        // if (moment(totalDiasMes).toDate().getTime() > fechaInicioDisfrute.toDate().getTime()) {
        //   const errors = {};
        //   errors['La fecha de inicio no puede ser ser diferente al mes en curso o inferior.'] = true;
        //   formGroup.get('fechaInicioDisfrute').setErrors(errors);
        // }
      }
    }

    if (value.funcionario != null && typeof value.funcionario !== 'object') {

      const errors = {};
      errors['Por favor, seleccione un funcionario.'] = true;
      formGroup.get('funcionario').setErrors(errors);
    }

    return null;
  }

  displayFn(element: any): string {
    return element ? element.criterioBusqueda : element;
  }

  private _getPeriodos(): void {
    const funcionario = this.form.get('funcionario').value;
    this.periodosOptions = [];
    if (funcionario != null &&
      typeof funcionario === 'object'
    ) {
      this._service.getLibroVacaciones(funcionario.id).then(
        resp => {
          this.periodosOptions = resp;
          this.libroVacaciones = resp[0];
        }
      );
    }
  }

  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    if (formValue.funcionario) {
      formValue.funcionarioId = formValue.funcionario.id;
    }

    // libro vacaciones para el crear
    if (this.libroVacaciones) {
      formValue.libroVacacionesId = this.libroVacaciones.id;
    }

    // libro vacaciones y funcionario para el editar
    if (this.item) {
      formValue.libroVacacionesId = this.item.libroVacaciones.id;
      formValue.funcionarioId = this.item.funcionario.id;
    }

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._router.navigate([`/vacaciones/solicitudes`]);
      }
      ).catch((resp: HttpErrorResponse) => {
        let mensaje = 'Se ha presentado un error en el servidor.';
        if (resp.status === 400) {
          mensaje = 'Se ha presentado un error al procesar el formulario.';
        }

        this.submit = false;
        let error = resp.error;
        if (typeof resp.error === 'string') {
          error = JSON.parse(resp.error);
        } else {
          error = resp.error;
        }

        if ('snackbar' in error.errors) {
          const errors = {};
          error.errors.snackbar.forEach(element => {
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: element,
              time: 6000
            });
          });
        }

        if ('libroVacacionesId' in error.errors) {
          const errors = {};
          error.errors.libroVacacionesId.forEach(element => {
            this._alcanosSnackBar.snackbar({
              clase: 'error',
              mensaje: 'Libro de vacaciones: ' + element,
              time: 6000
            });
          });
        }

        if (resp.status === 400 && 'errors' in error) {
          if ('funcionarioId' in error.errors) {
            const errors = {};
            error.errors.funcionarioId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('funcionario').setErrors(errors);
          }

          if ('fechaInicioDisfrute' in error.errors) {
            const errors = {};
            error.errors.fechaInicioDisfrute.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaInicioDisfrute').setErrors(errors);
          }
          if ('diasDisfrute' in error.errors) {
            const errors = {};
            error.errors.diasDisfrute.forEach(element => {
              errors[element] = true;
            });
            this.form.get('diasDisfrute').setErrors(errors);
          }
          if ('fechaFinDisfrute' in error.errors) {
            const errors = {};
            error.errors.fechaFinDisfrute.forEach(element => {
              errors[element] = true;
            });
            this.form.get('fechaFinDisfrute').setErrors(errors);
          }
          if ('diasDinero' in error.errors) {
            const errors = {};
            error.errors.diasDinero.forEach(element => {
              errors[element] = true;
            });
            this.form.get('diasDinero').setErrors(errors);
          }
          if ('observacion' in error.errors) {
            const errors = {};
            error.errors.observacion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('observacion').setErrors(errors);
          }
          if ('estado' in error.errors) {
            const errors = {};
            error.errors.estado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('estado').setErrors(errors);
          }

        }

      });

  }

}
