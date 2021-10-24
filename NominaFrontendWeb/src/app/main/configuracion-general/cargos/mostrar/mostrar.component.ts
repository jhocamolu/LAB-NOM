import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
import { MostrarService } from './mostrar.service';
import { EditarComponent } from '../editar/editar.component';
import { ReportaComponent } from '../reporta/reporta.component';
import { DependenciaComponent } from '../dependencia/dependencia.component';
import { GradoComponent } from '../grado/grado.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';

import { PresupuestoCrearComponent } from '../presupuesto/crear/crear.component';
import { PresupuestoEditarComponent } from '../presupuesto/editar/editar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'cargos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [fuseAnimations],
})
export class MostrarComponent implements OnInit {

  // Permisos
  arrayPermisos: any;
  arrayPermisosDependencias: any;
  arrayPermisosReporta: any;
  arrayPermisosGrados: any;
  arrayPermisosGrupos: any;
  arrayPermisosPresupuesto: any;

  submit: boolean;
  element: any;
  cargoCount: any;
  //
  cargoDependencias: any;
  dependenciasCount: any;
  //
  cargoReportas: any;
  cargosCount: any;
  //
  cargoGrados: any;
  gradosCount: any;
  //
  cargoGrupos: any;
  gruposCount: any;

  //
  presupuestoGrupos: any;
  presupuestoCount: any

  elements: any;
  selectedTab = 0;
  cargoId: number;
  // etiqueta 6
  cargoPresupuetosList: any[] = [];

  estoyReportandoAList: any[] = [];

  @ViewChild(EditarComponent, { static: false })
  editarItems: EditarComponent;

  constructor(
    // public dialogRef: MatDialogRef<MostrarComponent>,
    // @Inject(MAT_DIALOG_DATA) public element: any,
    // private _formBuilder: FormBuilder,
    private _alcanosSnackBar: AlcanosSnackBarService,
    public _service: MostrarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService
  ) {
    this.cargoId = this._service.id;
    this.submit = false;
    this.arrayPermisos = this._permisos.permisosStorage('Cargos_');
    this.arrayPermisosDependencias = this._permisos.permisosStorage('CargoDependencias_');
    this.arrayPermisosReporta = this._permisos.permisosStorage('CargoReportas_');
    this.arrayPermisosGrados = this._permisos.permisosStorage('CargoGrados_');
    this.arrayPermisosGrupos = this._permisos.permisosStorage('CargoGrupos_');
    this.arrayPermisosPresupuesto = this._permisos.permisosStorage('CargoPresupuestos_');

    // this.elements = element;
  }

  ngOnInit(): void {
    this._service.onCargoChanged.subscribe((resp) => {
      this.element = resp;
    });

    this._service.onDataCargosReporta.subscribe((resp) => {
      this.estoyReportandoAList = resp;
      this.cargosCount = resp['@odata.count'] === 0 ? true : false;
    });

    this._service.onCargoPresupuestos.subscribe((resp) => {
      this.presupuestoCount = resp['@odata.count'] === 0 ? true : false;
      this.cargoPresupuetosList = resp;
    });

    this._service.onReportaChanged.subscribe((resp) => {
      this.cargosCount = resp['@odata.count'] === 0 ? true : false;
      this.cargoReportas = resp.value;
    });

    this._service.onDependenciasChanged.subscribe((resp) => {
      this.dependenciasCount = resp['@odata.count'] === 0 ? true : false;
      this.cargoDependencias = resp.value;
    });

    this._service.onGradosChanged.subscribe((resp) => {
      this.gradosCount = resp['@odata.count'] === 0 ? true : false;
      this.cargoGrados = resp.value;
    });

    this._service.onGruposChanged.subscribe((resp) => {
      this.gruposCount = resp['@odata.count'] === 0 ? true : false;
      this.cargoGrupos = resp.value;
    });
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

        // this.selectedTab = 2; V4
        this._service.getCargosReportas();
      }
    });
  }

  // se comunica con el componente Dependencia
  dependenciaHandle(event): void {
    const dialogRef = this._matDialog.open(DependenciaComponent, {
      panelClass: 'modal-dialog',
      data: { id: this.element.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
       //  this.selectedTab = 1; V4
        this._service.getCargoDependencias();
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
        // this.selectedTab = 5; V4
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
       //  this.selectedTab = 5; V4
        this._service.getCargoPresupuestos();
      }
    });
  }


  // se comunica con el componente Grado
  gradoHandle(event): void {
    const dialogRef = this._matDialog.open(GradoComponent, {
      panelClass: 'modal-dialog',
      data: {
        cargoId: this.element.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
       //  this.selectedTab = 3; V4
        this._service.getCargosGrados();
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


  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }
}
