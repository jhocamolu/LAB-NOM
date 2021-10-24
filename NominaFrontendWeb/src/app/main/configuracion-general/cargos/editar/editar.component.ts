import { Component, OnInit, Inject, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { EditarService } from './editar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

import { fuseAnimations } from '@fuse/animations';
import { ReportaComponent } from '../reporta/reporta.component';
import { GradoComponent } from '../grado/grado.component';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DependenciaComponent } from '../dependencia/dependencia.component';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlcanosValidators } from '@alcanos/utils';
import { Router } from '@angular/router';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { grupoPorDefectoAlcanos } from '@alcanos/constantes/cargo-grupopordefecto';
import { PresupuestoCrearComponent } from '../presupuesto/crear/crear.component';
import { PresupuestoEditarComponent } from '../presupuesto/editar/editar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
  selector: 'cargos-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [fuseAnimations],
})
export class EditarComponent implements OnInit {

  // Permisos
  arrayPermisos: any;
  arrayPermisosDependencias: any;
  arrayPermisosReporta: any;
  arrayPermisosGrados: any;
  arrayPermisosGrupos: any;
  arrayPermisosPresupuesto: any;

  form: FormGroup;
  submit: boolean;
  element: any;
  id: any;
  selectedTab: number;
  defecto = grupoPorDefectoAlcanos;
  cargoId: number;
  nivelCargoOptions: any[] = [];

  // etiqueta 2
  estoyReportandoAList: any[] = [];
  // etiqueta 3 
  dependenciasList: any[] = [];
  // etiqueta 4
  cargoGradosList: any[] = [];
  // etiqueta 5
  cargoGruposList: any[] = [];
  // etiqueta 6
  cargoPresupuetosList: any[] = [];

  // tslint:disable-next-line: no-input-rename
  @Input('cargo') itemCargo: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matSnackBar: MatSnackBar,
    private _service: EditarService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _permisos: PermisosrService
  ) {
    this.form = this._formBuilder.group({
      codigo: [null, [Validators.required, AlcanosValidators.maxLength(10), AlcanosValidators.alfanumerico]],
      nombre: [null, [Validators.required, AlcanosValidators.maxLength(40), AlcanosValidators.alfanumerico]],
      objetivoCargo: [null, [Validators.required]],
      nivelCargoId: [null, [Validators.required]],
      costoSicom: [null, [Validators.required]],
      clase: [null, [Validators.required]],
    });
    this.cargoId = this._service.id;
    this.submit = false;
    this.selectedTab = this._service.selectedTab;
    // permisos
    this.arrayPermisos = this._permisos.permisosStorage('Cargos_');
    this.arrayPermisosDependencias = this._permisos.permisosStorage('CargoDependencias_');
    this.arrayPermisosReporta = this._permisos.permisosStorage('CargoReportas_');
    this.arrayPermisosGrados = this._permisos.permisosStorage('CargoGrados_');
    this.arrayPermisosGrupos = this._permisos.permisosStorage('CargoGrupos_');
    this.arrayPermisosPresupuesto = this._permisos.permisosStorage('CargoPresupuestos_');
  }

  ngOnInit(): void {
    this._service.onDataCargosReporta.subscribe(data => {
      this.estoyReportandoAList = data;
    });
    this._service.onDependencias.subscribe(data => {
      this.dependenciasList = data;
    });
    this._service.onDataGradosReporta.subscribe(data => {
      this.cargoGradosList = data;
    });
    this._service.onGrupos.subscribe(data => {
      this.cargoGruposList = data;
    });
    this._service.onCargoPresupuestos.subscribe(data => {
      this.cargoPresupuetosList = data;
    });

    this._service.onCargoChanged.subscribe(data => {
      this.form.patchValue({
        id: data.id,
        codigo: data.codigo,
        nombre: data.nombre,
        objetivoCargo: data.objetivoCargo,
        nivelCargoId: data.nivelCargoId,
        costoSicom: data.costoSicom,
        clase: data.clase,

      });

    });
    this.form.markAllAsTouched();
    this.selectNivelCargosLista();
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

  public tercero(): void {
    this.selectedTab = 2;
  }

  public cuarto(): void {
    this.selectedTab = 3;
  }

  public quinto(): void {
    this.selectedTab = 4;
  }

  public sexto(): void {
    this.selectedTab = 5;
  }


  public selectNivelCargosLista(): void {
    this._service.getNivelCargoLista().then(
      (resp: any[]) => {
        this.nivelCargoOptions = resp;
      });
  }

  public deleteReporta(event, id): void {
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
          this._service.getCargosReportas();
        });
      }
    });
  }


  public deleteGrado(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.borrarGrados(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.getCargosGrados();
        });
      }
    });
  }

  public deleteGrupo(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.borrarGrupos(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.getCargoGrupos();
        }).catch((resp: HttpErrorResponse) => {
          this.submit = false;
          let error = resp.error;
          if (typeof resp.error === 'string') {
            error = JSON.parse(resp.error);
          } else {
            error = resp.error;
          }

          if (resp.status === 400 && 'errors' in error) {
            if ('snack' in error.errors) {
              let msg = '';
              error.errors.snack.forEach(element => {
                msg = element;
              });
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: msg,
                time: 5000
              });
            }
          }

          if (resp.status === 400 && 'errors' in error) {
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
    });

  }

  public deleteDependencias(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.borrarDependencias(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.getCargoDependencias();
        }).catch((resp: HttpErrorResponse) => {
          this.submit = false;
          let error = resp.error;
          this._matSnackBar.open(error.message, 'Aceptar', {
            verticalPosition: 'top',
            duration: 6000,
            panelClass: ['error-snackbar'],
          });
          this._service.getCargoDependencias();
        });
      }
    });
  }


  activarHandle(event, element): void {
    const id = element.id;
    const estado = `${element.estadoRegistro}`.toLocaleLowerCase();
    const verboInverso = element.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
    const clase = element.estadoRegistro === 'Activo' ? 'error' : 'exito';
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
        clase: clase,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const bool = element.estadoRegistro === 'Activo' ? false : true;
        this._service.activo(id, bool).then(result => {
          this._service.getCargosGrados();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
      }
    });
  }

  changeTab(): void {
    this.selectedTab += 1;
    if (this.selectedTab >= 3) {
      this.selectedTab = 0;
    }
  }

  editarReportaHandle(event, element): void {
    const dialogRef = this._matDialog.open(ReportaComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getCargosReportas();
      }
    });
  }

  presupuestoCrearHandle(event, element): void {
    const dialogRef = this._matDialog.open(PresupuestoCrearComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getCargoPresupuestos();
      }
    });
  }

  presupuestoEditarHandle(event, element): void {
    const dialogRef = this._matDialog.open(PresupuestoEditarComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getCargoPresupuestos();
      }
    });
  }

  // se comunica con el componente Reporta
  reportaHandle(event, element): void {
    const dialogRef = this._matDialog.open(ReportaComponent, {
      panelClass: 'modal-dialog',
      data: {
        cargoId: element
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {

        // this.selectedTab = 3; V4
        this._service.getCargosReportas();
      }
    });
  }

  // se comunica con el componente Grado
  gradoHandle(event): void {
    const dialogRef = this._matDialog.open(GradoComponent, {
      panelClass: 'modal-dialog',
      data: {
        cargoId: this._service.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
       // this.selectedTab = 3; V4
        this._service.getCargosGrados();
      }
    });
  }

  // se comunica con el componente Dependencia
  dependenciaHandle(event): void {
    const dialogRef = this._matDialog.open(DependenciaComponent, {
      panelClass: 'modal-dialog',
      data: { id: this._service.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        // this.selectedTab = 2; V4
        this._service.getCargoDependencias();
      }
    });
  }

  grupoHandle(event): void {
    this._service.crearGrupo().then(result => {
      this._alcanosSnackBar.snackbar({ clase: 'exito' });
      this._service.getCargoGrupos();
    })
      .catch((resp: HttpErrorResponse) => {
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
        }
      });
  }

  comparetNivelCargos(c1: any, c2: any): boolean {
    return c1 && c2 ? `${c1}`.trim() === `${c2}`.trim() : c1 === c2;
  }

  compareDependencias(c1: any, c2: any): boolean {
    return c1 && c2 ? `${c1}`.trim() === `${c2}`.trim() : c1 === c2;
  }

  get codigo(): AbstractControl {
    return this.form.get('codigo');
  }

  get categoria(): AbstractControl {
    return this.form.get('categoria');
  }

  get objetivoCargo(): AbstractControl {
    return this.form.get('objetivoCargo');
  }

  get nombre(): AbstractControl {
    return this.form.get('nombre');
  }
  get nivelCargoId(): AbstractControl {
    return this.form.get('nivelCargoId');
  }
  get clase(): AbstractControl {
    return this.form.get('clase');
  }
  get costoSicom(): AbstractControl {
    return this.form.get('costoSicom');
  }

  objToArray(obj: any): any[] {
    return obj !== null ? Object.keys(obj) : [];
  }

  guardarHandle(event): void {
    const formValue = this.form.value;
    this.submit = true;
    formValue.id = this._service.id;

    // se inyecta en el promise editar el id y el formValue
    this._service.editar(this._service.id, formValue)
      .then((resp) => {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.submit = false;
        this.selectedTab = 1;
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
          if ('categoria' in error.errors) {
            const errores = {};
            error.errors.categoria.forEach(element => {
              errores[element] = true;
            });
            this.categoria.setErrors(errores);
          }

          if ('codigo' in error.errors) {
            const errores = {};
            error.errors.codigo.forEach(element => {
              errores[element] = true;
            });
            this.codigo.setErrors(errores);
          }

          if ('nombre' in error.errors) {
            const errores = {};
            error.errors.nombre.forEach(element => {
              errores[element] = true;
            });
            this.nombre.setErrors(errores);
          }

          if ('objetivoCargo' in error.errors) {
            const errores = {};
            error.errors.objetivoCargo.forEach(element => {
              errores[element] = true;
            });
            this.objetivoCargo.setErrors(errores);
          }

          if ('nivelCargoId' in error.errors) {
            const errores = {};
            error.errors.nivelCargoId.forEach(element => {
              errores[element] = true;
            });
            this.nivelCargoId.setErrors(errores);
          }

          if ('clase' in error.errors) {
            const errores = {};
            error.errors.clase.forEach(element => {
              errores[element] = true;
            });
            this.clase.setErrors(errores);
          }

          if ('costoSicom' in error.errors) {
            const errores = {};
            error.errors.costoSicom.forEach(element => {
              errores[element] = true;
            });
            this.costoSicom.setErrors(errores);
          }
        }
      });
  }

}

