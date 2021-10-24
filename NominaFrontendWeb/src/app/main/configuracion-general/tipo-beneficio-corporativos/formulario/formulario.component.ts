import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormularioService } from './formulario.service';
// Autocompletable
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosValidators } from '@alcanos/utils';

import * as moment from 'moment';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
import { RequisitoComponent } from '../requisito/requisito.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'formulario-tipo-beneficios',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class FormularioComponent implements OnInit, AfterViewInit {

  // Permisos
  arrayPermisosRequisitos: any;

  enviroments: string = environmentAlcanos.gestorArchivos;

  form: FormGroup;
  submit: boolean;
  item: any;

  tipoBeneficios: any[];
  subPeriodos: any[];
  actualizaPrioridad: boolean;
  valorEmbargo: any;
  tipoPeriodos: any;
  // Arrays si y no para integrarlo en forms
  eleccion: any;

  // conceptos de nómina
  devengo: any;
  deduccion: any;
  calculo: any;

  selectedTab = 0;

  path: any;
  requisitos: any;
  count: number;

  desabilitar: boolean = false;
  id: number;

  /**
   * 
   * @param _formBuilder 
   * @param _matDialog 
   * @param _router 
   * @param _service 
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _service: FormularioService,
    private _permisos: PermisosrService
  ) {
    this.selectedTab = this._service.selectedTab;
    this.submit = false;
    this.eleccion = [{ id: true, nombre: 'Si' }, { id: false, nombre: 'No' }];
    this.id = null;
    //console.log(id);
    this.form = this._formBuilder.group({
      id: [null, []],
      nombre: [null, [Validators.required, AlcanosValidators.alfabetico, AlcanosValidators.maxLength(100)]],
      requiereAprobacionJefe: [null, [Validators.required]],
      montoMaximo: [null, [Validators.required]],
      conceptoNominaDevengoId: [null, []],
      conceptoNominaDeduccionId: [null, []],
      conceptoNominaCalculoId: [null, []],
      valorSolicitado: [null, [Validators.required]],
      plazoMes: [null, [Validators.required]],
      cuotaPermitida: [null, [Validators.required, Validators.max(60), AlcanosValidators.numerico]],
      periodoPago: [null, [Validators.required]],
      permiteAuxilioEducativo: [null, [Validators.required]],
      permiteDescuentoNomina: [null, [Validators.required]],
      permisoEstudio: [null, [Validators.required]],
      valorAutorizado: [null, [Validators.required]],
      diasAntiguedad: [null, [Validators.required, Validators.max(1000), AlcanosValidators.numerico]],
      vecesAnio: [null, [Validators.required, Validators.max(1000), AlcanosValidators.numerico]],
      descripcion: [null, []],
    });

    this.arrayPermisosRequisitos = this._permisos.permisosStorage('TipoBeneficioRequisitos_');

  }


  // se comunica con el componente Dependencia
  requisitoHandle(event): void {
    const dialogRef = this._matDialog.open(RequisitoComponent, {
      panelClass: 'crear-dialog',
      data: { id: this._service.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._service.getRequisito(this.id).then((resp) => {
          this.requisitos = resp;
          this.count = this._service.totalCount;
        });
        this.selectedTab = 1;
      }
    });
  }

  ngOnInit(): void {
    // Determina si se observa o no el requisitos
    this.path = this._service.path;


    this._service.getConceptoNomina(ClaseConceptoAlcanos.deduccion).then((resp) => {
      this.deduccion = resp;
    });

    this._service.getConceptoNomina(ClaseConceptoAlcanos.devengo).then((resp) => {
      this.devengo = resp;
    });

    this._service.getConceptoNomina(ClaseConceptoAlcanos.calculo).then((resp) => {
      this.calculo = resp;
    });

    this._service.onItemChanged.subscribe(
      (response: any) => {
        this.item = response;
        if (response != null) {

          this.id = this.item.id;
          this.desabilitar = true;

          this.form.patchValue({
            id: this.item.id,
            nombre: this.item.nombre,
            requiereAprobacionJefe: this.item.requiereAprobacionJefe,
            montoMaximo: this.item.montoMaximo,
            conceptoNominaDevengoId: this.item.conceptoNominaDevengoId,
            conceptoNominaDeduccionId: this.item.conceptoNominaDeduccionId,
            conceptoNominaCalculoId: this.item.conceptoNominaCalculoId,
            valorSolicitado: this.item.valorSolicitado,
            plazoMes: this.item.plazoMes,
            cuotaPermitida: this.item.cuotaPermitida,
            periodoPago: this.item.periodoPago,
            permiteAuxilioEducativo: this.item.permiteAuxilioEducativo,
            permiteDescuentoNomina: this.item.permiteDescuentoNomina,
            permisoEstudio: this.item.permisoEstudio,
            valorAutorizado: this.item.valorAutorizado,
            diasAntiguedad: this.item.diasAntiguedad,
            vecesAnio: this.item.vecesAnio,
            descripcion: this.item.descripcion,
          });

          this._service.getRequisito(this.id).then((resp) => {
            this.requisitos = resp;
            this.count = this._service.totalCount;
          });

          this.form.markAllAsTouched();

        }
      }
    );

  }

  ngAfterViewInit(): void {
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }


  public deleteRequisito(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.borrar(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.getRequisito(this.id).then((resp) => {
            this.requisitos = resp;
            this.count = this._service.totalCount;
          });
        });
      }
    });
  }


  guardarHandle(event): void {
    this.submit = true;
    const formValue = this.form.value;

    this._service.upsert(formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        // this.segundo();
        this.submit = false;
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';
        this._service.getTipoBeneficios(resp.id);
        this._router.navigate([`configuracion/beneficios/${resp.id}/editar`], { queryParams: { tab: 1 } });
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

          if ('nombre' in error.errors) {
            const errors = {};
            error.errors.nombre.forEach(element => {
              errors[element] = true;
            });
            this.form.get('nombre').setErrors(errors);
          }

          if ('requiereAprobacionJefe' in error.errors) {
            const errors = {};
            error.errors.requiereAprobacionJefe.forEach(element => {
              errors[element] = true;
            });
            this.form.get('requiereAprobacionJefe').setErrors(errors);
          }

          if ('montoMaximo' in error.errors) {
            const errors = {};
            error.errors.montoMaximo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('montoMaximo').setErrors(errors);
          }

          if ('conceptoNominaDevengoId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaDevengoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaDevengoId').setErrors(errors);
          }

          if ('conceptoNominaDeduccionId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaDeduccionId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaDeduccionId').setErrors(errors);
          }

          if ('conceptoNominaCalculoId' in error.errors) {
            const errors = {};
            error.errors.conceptoNominaCalculoId.forEach(element => {
              errors[element] = true;
            });
            this.form.get('conceptoNominaCalculoId').setErrors(errors);
          }

          if ('valorSolicitado' in error.errors) {
            const errors = {};
            error.errors.valorSolicitado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valorSolicitado').setErrors(errors);
          }

          if ('plazoMes' in error.errors) {
            const errors = {};
            error.errors.plazoMes.forEach(element => {
              errors[element] = true;
            });
            this.form.get('plazoMes').setErrors(errors);
          }

          if ('cuotaPermitida' in error.errors) {
            const errors = {};
            error.errors.cuotaPermitida.forEach(element => {
              errors[element] = true;
            });
            this.form.get('cuotaPermitida').setErrors(errors);
          }

          if ('periodoPago' in error.errors) {
            const errors = {};
            error.errors.periodoPago.forEach(element => {
              errors[element] = true;
            });
            this.form.get('periodoPago').setErrors(errors);
          }

          if ('permiteAuxilioEducativo' in error.errors) {
            const errors = {};
            error.errors.permiteAuxilioEducativo.forEach(element => {
              errors[element] = true;
            });
            this.form.get('permiteAuxilioEducativo').setErrors(errors);
          }

          if ('permiteDescuentoNomina' in error.errors) {
            const errors = {};
            error.errors.permiteDescuentoNomina.forEach(element => {
              errors[element] = true;
            });
            this.form.get('permiteDescuentoNomina').setErrors(errors);
          }

          if ('valorAutorizado' in error.errors) {
            const errors = {};
            error.errors.valorAutorizado.forEach(element => {
              errors[element] = true;
            });
            this.form.get('valorAutorizado').setErrors(errors);
          }

          if ('diasAntiguedad' in error.errors) {
            const errors = {};
            error.errors.diasAntiguedad.forEach(element => {
              errors[element] = true;
            });
            this.form.get('diasAntiguedad').setErrors(errors);
          }

          if ('vecesAnio' in error.errors) {
            const errors = {};
            error.errors.vecesAnio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('vecesAnio').setErrors(errors);
          }


          if ('permisoEstudio' in error.errors) {
            const errors = {};
            error.errors.permisoEstudio.forEach(element => {
              errors[element] = true;
            });
            this.form.get('permisoEstudio').setErrors(errors);
          }

          if ('descripcion' in error.errors) {
            const errors = {};
            error.errors.descripcion.forEach(element => {
              errors[element] = true;
            });
            this.form.get('descripcion').setErrors(errors);
          }

        }
      });
  }

}
