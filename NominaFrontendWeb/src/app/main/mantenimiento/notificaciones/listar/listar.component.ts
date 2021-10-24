import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { LogComponent } from '../log/log.component';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import * as moment from 'moment';

@Component({
  selector: 'tipo-beneficios-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['tipo', 'titulo', 'fecha', 'pendiente', 'enviado', 'fallido', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataRequest: boolean;
  random: number;
  // Permisos
  arrayPermisos: any;
  arrayPermisosLogs: any;
  loadTable: boolean;

  constructor(
    private _router: Router,
    private _service: ListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _matDialog: MatDialog,
    private _alcanosSnackbar: AlcanosSnackBarService,
    private _permisos: PermisosrService
  ) {
    this.dataRequest = false;
    this.random = parseInt(String(Math.random() * (50 - 20)), 10);
    this.arrayPermisos = this._permisos.permisosStorage('Notificaciones_', null, 'Notificaciones_Ejecutar', 'NotificacionDestinatarioLogs_Listar');
    this.arrayPermisosLogs = this._permisos.permisosStorage('NotificacionDestinatarioLogs_', null, 'NotificacionDestinatarioLogs_Listar');
  }

  ngOnInit(): void {

    this._service.dataRequest.subscribe(
      (resp: boolean) => {
        this.dataRequest = resp;
      }
    );
    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
    this.paginator.page.subscribe(
      (event: PageEvent) => {
        const skip = event.pageIndex * event.pageSize;
        this._router.navigate(
          ['/mantenimiento/notificaciones/'],
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
          ['/mantenimiento/notificaciones/'],
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


  urlLink(event): any {
    return this._router.navigate(['/mantenimiento/notificaciones/crear']);
  }

  ejecutarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de enviar la notificación?`,
        clase: 'informativo',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.loadTable = true;
        this._service.ejecutar(element.id).then(result => {
          setTimeout(() => {
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            this._router.onSameUrlNavigation = 'reload';
            this._router.navigate([`/mantenimiento/notificaciones`], {
              queryParams: {
                updated: moment(),
              },
            }).then(result =>{
              this.loadTable = false;
            });
          }, 100);
          
          // tslint:disable-next-line: max-line-length
          this._alcanosSnackbar.snackbar({
            clase: 'exito',
            mensaje: 'Se ha iniciado la ejecución de la notificación, consulte en unos minutos para ver los resultados.',
            time: 5000
          });
        })
          .catch((resp: HttpErrorResponse) => {
            let errors = null;
            this.loadTable = false;
            if (resp.status === 400 && 'message' in resp.error) {
              errors = resp.error.message;
            }
            this._alcanosSnackbar.snackbar({
              clase: 'error',
              mensaje: errors,
            });
          });
      }
    });
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

  logHandle(event, element): void {
    const dialogRef = this._matDialog.open(LogComponent, {
      panelClass: 'modal-dialog900',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { }
    });
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
      ['/mantenimiento/notificaciones/'],
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
