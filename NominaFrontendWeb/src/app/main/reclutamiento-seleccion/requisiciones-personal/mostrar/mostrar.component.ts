import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar, Sort, MatSort, MatPaginator, MatTabChangeEvent } from '@angular/material';
import { merge, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { map } from 'rxjs/operators';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { EstadoComponent } from '../estado/estado.component';
import { estadoRequisicionPersonalAlcanos } from '@alcanos/constantes/estado-requisicion-personal';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { SeleccionadosListarService } from '../seleccionados/listar/listar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'contratos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  environments: any;
  item: any;
  indexTab: number;
  desabilitar: boolean = true;

  count: number;

  estadoRequisicion = estadoRequisicionPersonalAlcanos;
  // Permisos
  arrayPermisos: any;
  arrayPermisoCandidatos: any; 

  constructor(
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _service2: SeleccionadosListarService,
    private _permisos: PermisosrService
  ) {
    this.environments = environmentAlcanos;
    this.indexTab = this._service.tab;
    this.arrayPermisos = this._permisos.permisosStorage('RequisicionPersonales_');
    this.arrayPermisoCandidatos = this._permisos.permisosStorage('Candidatos_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;

        if (this.item.estado === estadoRequisicionPersonalAlcanos.autorizada || this.item.estado === estadoRequisicionPersonalAlcanos.cubierta) {
          this.desabilitar = false;
        }
      }
    );

    this._service.totalSelecionados.subscribe(resp => this.count = resp);
  }

  refreshCount(event): void {
    this._service.getcandidatos();
  }

  onTabChangedHandle(event: MatTabChangeEvent): void {
    this.indexTab = event.index;
  }

  estadoHandle(event, type): void {
    const dialogRef = this._matDialog.open(EstadoComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: { id: this._service.id, type: type },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getRequisicionPersonales();
      }
    });
  }


}
