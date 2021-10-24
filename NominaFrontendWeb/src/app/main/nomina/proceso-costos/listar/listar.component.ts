import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ObtenerActividadComponent } from '../obtener-actividad/aprobar.component';
import { ManualActividadComponent } from '../registro-manual/manual.component';

@Component({
  selector: 'proceso-costos-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['funcionario/numeroDocumento', 'funcionario/criterioBusqueda', 'dependencia', 'cargo', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataRequest: boolean;

  // Permisos
  arrayPermisos: any;
  arrayPermisosCentroCostos: any; 

  constructor(
    private _router: Router,
    private _service: ListarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService
  ) {
    this.dataRequest = false;
    this.arrayPermisos = this._permisos.permisosStorage('ActividadFuncionarios_');
    this.arrayPermisosCentroCostos = this._permisos.permisosStorage('FuncionarioCentroCostos_', null, 'FuncionarioCentroCostos_CrearManual');
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
          ['/nomina/proceso-costos'],
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
          ['/nomina/proceso-costos'],
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

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy(): void {
    this.dataSource = null;
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

  obtenerActividadHandle(event): void {
    const dialogRef = this._matDialog.open(ObtenerActividadComponent, {
      panelClass: 'modal-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this._service.getProcesoCostos();
    });
  }

  costoManualHandle(event): void {
    const dialogRef = this._matDialog.open(ManualActividadComponent, {
      panelClass: 'modal-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this._service.getProcesoCostos();
    });
  }


  generarCostosHandle(event): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Desea generar los centros de costos con las actividades que se encuentran actualmente?`,
        clase: `informativo`,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      this._service.generarCostos(confirm)
        .then((resp) => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {

          let error = resp.error;
          if (typeof resp.error === 'string') {
            error = JSON.parse(resp.error);
          }

          if (resp.status === 400 && 'errors' in error) {
            if ('dialogoConfirmacion' in error.errors) {
              let msg = '';
              error.errors.dialogoConfirmacion.forEach(element => {
                msg = element;
              });
              this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: msg,
                time: 6000
              });
            }
          }

          if (resp.status === 400 && 'errors' in error) {
            if ('dialogoError' in error.errors) {
              error.errors.dialogoError .forEach(element => {
                this._alcanosSnackBar.snackbar({
                  clase: 'error',
                  mensaje: element,
                  time: 6000
                });
              });
              
            }
          }
        });
    });
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
      ['/nomina/proceso-costos'],
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
