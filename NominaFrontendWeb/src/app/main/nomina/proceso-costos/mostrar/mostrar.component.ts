import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { MatPaginator } from '@angular/material';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { MatDialog } from '@angular/material/dialog';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';

import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Component({
  selector: 'procesar-costos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  bases: any[] = [];

  item: any;
  selectedTab = 0;
  arrayPermisos: any;
  arrayPermisosCentroCostos: any; 

  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;


  constructor(
    private _service: MostrarService,
    private _permisos: PermisosrService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('ActividadFuncionarios_');
    this.arrayPermisosCentroCostos = this._permisos.permisosStorage('FuncionarioCentroCostos_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );

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

  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }

  limpiarActividades(event): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Desea limpiar las actividades que se encuentran actualmente?`,
        clase: `informativo`,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.limpiarActividades()
          .then((resp) => {
            this._alcanosSnackBar.snackbar({ clase: 'exito' });
          }).catch((resp) => {
          });
      }
    });
  }

}

