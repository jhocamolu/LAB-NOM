import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ParametroService } from './parametro.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { CrearEstadoComponent } from '../crear-estado/crear-estado.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

import { FormularioParametroComponent } from '../parametros-formulario/formulario.component';

@Component({
  selector: 'tipo-liquidaciones-parametros',
  templateUrl: './parametro.component.html',
  styleUrls: ['./parametro.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ParametroComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  arrayPermisos: any;

  dataLength: number | null;
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['tipoComprobante', 'centroCosto/codigo', 'cuentaContable/cuenta', 'cuentaContable/naturaleza', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // tslint:disable-next-line: no-input-rename
  @Input('tipo-liquidaciones-id') id: any;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-boton-crear') mostrarBtnCrear: boolean = true;

  dataRequest: boolean;

  selectedTab: number;

  constructor(
    private _service: ParametroService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('TipoLiquidacionComprobantes_');
    this.dataRequest = true;
  }

  ngOnInit(): void {
    this._service.init(this.id);
    this.dataRequest = true;
    this._service.dataRequest.subscribe(
      (resp: boolean) => {
        this.dataRequest = resp;
      }
    );
    this._service.totalCount.subscribe(
      resp => {
        this.dataLength = (resp > 0) ? resp : null;

      }
    );

    this.paginator.page.subscribe(
      (event: PageEvent) => {
        const skip = event.pageIndex * event.pageSize;
        const queryParams = {
          $top: event.pageSize,
          $skip: skip,
        };
        this._service.buildFilter(queryParams);
      }

    );

    this.sort.sortChange.subscribe(
      (event: Sort) => {
        const orderBy = `${event.active} ${event.direction}`;
        const queryParams = {
          $orderBy: orderBy,
        };
        this._service.buildFilter(queryParams);
      }
    );

    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
  }

  ngAfterViewInit(): void {
  }

  editarHandle(event, element): void {
    const dialogRef = this._matDialog.open(FormularioParametroComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.buildFilter({});
      }
    });
  }

  // se comunica con el componente Crear
  crearParametroHandle(event): void {
    const dialogRef = this._matDialog.open(FormularioParametroComponent, {
      panelClass: 'modal-dialog',
      data: {
        tipoLiquidacionId: this._service.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const queryParams = {
          $filter: 'true'
        };
        this._service.buildFilter(queryParams);
      }
    });
  }

  eliminarHandle(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ??Est??s seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminar(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.buildFilter({});
        });
      }
    });
  }

  renameEstado(estado: string): string {
    if (estado === 'Contabilizacion') {
      estado = 'Contabilizaci??n';
    }
    if (estado === 'Reversion') {
      estado = 'Reversi??n';
    }
   
    return estado;
  }

  renameNaturaleza(estado: string): string {
    if (estado === 'Debito') {
      estado = 'D??bito';
    }    
    if (estado === 'Credito') {
      estado = 'Cr??dito';
    }      
    return estado;
  }


  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }

  estadoHandle(event): void {
    const dialogRef = this._matDialog.open(CrearEstadoComponent, {
      panelClass: 'modal-dialog',
      data: {
        id: this.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {

        this.selectedTab = 2;
      }
    });
  }

}


export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: ParametroService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onItemsChanged,
      this._matSort.sortChange
    ];


    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.items.slice();
          this._matPaginator.pageSize = this._service.paginadorFilters['$top'];
          this._matPaginator.pageIndex = this._service.page;
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}
