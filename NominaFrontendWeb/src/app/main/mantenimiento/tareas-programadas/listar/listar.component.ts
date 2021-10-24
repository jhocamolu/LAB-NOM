import { AlcanosSnackBarService } from './../../../../../@alcanos/services/snackbar/snackbar.service';
import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { LogComponent } from '../log/log.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tareas-programadas-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['nombre', 'enEjecucion', 'periodicidad', 'fechaModificacion', 'acciones'];

  item: any;
  dataRequest: boolean;


  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // Permisos
  arrayPermisos: any;
  arrayPermisosLogs: any;

  constructor(
    private _router: Router,
    private _service: ListarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService
  ) {
    this.dataRequest = false;
    this.arrayPermisos = this._permisos.permisosStorage('TareaProgramadas_', null, 'TareaProgramadas_Ejecutar', 'TareaProgramadaLogs_Listar');
    this.arrayPermisosLogs = this._permisos.permisosStorage('TareaProgramadaLogs_');
  }
  
  ngOnInit(): void {
    this._service.onItemsChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );
    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
    this.paginator.page.subscribe(
      (event: PageEvent) => {
        const skip = event.pageIndex * event.pageSize;
        this._router.navigate(
          ['/mantenimiento/tareas-programadas'],
          {
            queryParams: {
              $top: event.pageSize,
              $skip: skip,
            },
            queryParamsHandling: 'merge',
          });
      }
    );

    this.sort.sortChange.subscribe(
      (event: Sort) => {
        const orderBy = `${event.active} ${event.direction}`;
        this._router.navigate(
          ['/mantenimiento/tareas-programadas'],
          {
            queryParams: {
              $orderBy: orderBy,
            },
            queryParamsHandling: '',
          });
      }
    );

  }

  get dataLength(): number {
    return this._service.totalCount;
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }

  ejecutarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de ejecutar la tarea programada?`,
        clase: 'informativo',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.ejecutar(element.alias).then(result => {
          this._service.getTareaProgramadas();
          // tslint:disable-next-line: max-line-length
          this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: 'Se ha iniciado la ejecución de la tarea programada, consulte en unos minutos para ver los resultados.', time: 5000 });

        }).catch((resp: HttpErrorResponse) => {
          let errors = null;
          if (resp.status === 400 && 'message' in resp.error) {
            errors = resp.error.message;
          }
          this._alcanosSnackBar.snackbar({
            clase: 'error',
            mensaje: errors,
          });
        });
      }
    });
  }

  logHandle(event, element): void {
    const dialogRef = this._matDialog.open(LogComponent, {
      panelClass: 'modal-dialog900',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  get filterSize(): number {
    let i = 0;
    for (const key in this._service.dataFilters) {
      if (this._service.dataFilters.hasOwnProperty(key)
        && this._service.dataFilters[key] != null &&
        `${this._service.dataFilters[key]}`.trim().length > 0
      ) {
        i++;
      }
    }
    return i;
  }

  get hasFilter(): boolean {
    return this.filterSize > 0;
  }

  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(FiltroComponent, {
      panelClass: 'filtro-dialog',
      hasBackdrop: true,
      data: this._service.dataFilters
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._service.dataFilters = result;
      }
    });
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/mantenimiento/tareas-programadas'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: ListarService,
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
          this._matPaginator.pageSize = this._service.urlFilters['$top'];
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


