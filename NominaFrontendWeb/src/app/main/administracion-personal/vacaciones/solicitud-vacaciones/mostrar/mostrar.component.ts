import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ListarService } from '../listar/listar.service';

import { AprobarComponent } from '../aprobar/aprobar.component';
import { AutorizarComponent } from '../autorizar/autorizar.component';
import { TerminarComponent } from '../terminar/terminar.component';
import { estadoVacacionesAlcanos } from '@alcanos/constantes/estado-vacaciones';
import { AnularComponent } from '../anular/anular.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'solicitud-vacaciones-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class MostrarComponent implements OnInit {

  estadoVacacionesAlcanos = estadoVacacionesAlcanos;

  id: any;
  item: any;
  selectedTab = 0;
  //
  interrupciones: any[];
  interrupcionesCount: any;
  arrayPermisos:any;
  constructor(
    private _router: Router,
    private _service: MostrarService,
    private _matDialog: MatDialog,
    private _service2: ListarService,
    private _permisos : PermisosrService
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('SolicitudVacaciones_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );

    this._service._getInterrupciones().then(resp => {
      this.interrupciones = resp.value;
      this.interrupcionesCount = resp['@odata.count'];
    });

  }

  editarHandle(event): void {
    this._router.navigate(
      [`/vacaciones/solicitudes/${this.item.id}/editar`],
    );
  }

  anularHanlde(event, item): void {
    const dialogRef = this._matDialog.open(AnularComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getSolicitudVacaciones();
      }
    });
  }

  aprobarHanlde(event, item): void {
    const dialogRef = this._matDialog.open(AprobarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getSolicitudVacaciones();
      }
    });
  }

  autorizarHanlde(event, item): void {
    const dialogRef = this._matDialog.open(AutorizarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getSolicitudVacaciones();
      }
    });
  }

  terminarHanlde(event, item): void {
    const dialogRef = this._matDialog.open(TerminarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getSolicitudVacaciones();
      }
    });
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }

  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }

}
