import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrearComponent } from '../crear/crear.component';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'annos-trabajo-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['anno', 'fechaCreacion', 'estado'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataRequest: boolean;
  arrayPermisos: any;


  constructor(
    private _service: ListarService,
    private _matSnackBar: MatSnackBar,
    private _router: Router,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _permisos: PermisosrService
  ) {
    // Obtengo los permisos desde el localstorage y los filtro dependendo el modulo
    this.arrayPermisos = this._permisos.permisosStorage('AnnoVigencias_');
    this.dataRequest = false;
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
          ['/configuracion/annos-trabajo'],
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
          ['/configuracion/annos-trabajo'],
          {
            queryParams: {
              $orderBy: orderBy,
            },
            queryParamsHandling: '',
          });
      }
    );

  }


  snackSinPermiso(): void {
    this._alcanosSnackBar.snackbar({
      clase: 'informativo',
      mensaje: 'No autorizado: sin permisos para realizar esta acción.',
    });
  }


  activarHandle(event, element: any): void {
    const id = element.id;
    const estado = element.estado === 'Vigente' ? 'Cerrado' : 'Vigente';
    const clase = estado ? 'exito' : 'error';
    const mensaje = estado ? 'El registro se encuentra inactivo ¿Estás seguro de activarlo?' : 'El registro se encuentra activo ¿Estás seguro de inactivarlo?'
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: mensaje,
        clase: clase,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.estado(id, estado).then(resp => {
          this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: '¡Perfecto! la operación se ha realizado exitosamente.', time: 6000 });
          this._service.getAnnosTrabajo(this._service.urlFilters);
        }).catch((resp: HttpErrorResponse) => {
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
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }


  get dataLength(): number {
    return this._service.totalCount;
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
      data: this._service.dataFilters,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._service.dataFilters = result;
      }
    });
  }

  limpiarHandle(event): void {
    this._router.navigate(
      ['/configuracion/annos-trabajo'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }


  crearHandle(event): void {
    const dialogRef = this._matDialog.open(CrearComponent, {
      panelClass: 'modal-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getAnnosTrabajo(this._service.urlFilters);
      }
    });
  }
}

export class FilesDataSource extends DataSource<any>
{

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
