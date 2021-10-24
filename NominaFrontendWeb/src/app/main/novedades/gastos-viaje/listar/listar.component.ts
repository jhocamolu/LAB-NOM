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
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tipoGastoViaje, tipoGastoViajeMostrar } from '@alcanos/constantes/gasto-viajes';
import localeCo from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeCo, 'co')

@Component({
  selector: 'gastos-viaje-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['funcionario/numeroDocumento', 'funcionario/primerNombre', 'tipoGastoViaje/tipo', 'fecha','valor', 'estado', 'estadoRegistro'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataRequest: boolean;

  //Constantes de gastos de viaje
  gastoViaje = tipoGastoViaje;
  gastoViajeM = tipoGastoViajeMostrar;

  constructor(
    private _router: Router,
    private _service: ListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _matDialog: MatDialog,
    private _alcanosSnackbar: AlcanosSnackBarService,
  ) {
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
          ['/novedades/gastos-viaje/'],
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
          ['/novedades/gastos-viaje/'],
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

  cambiarEstadoRegistros(id:number,estado:boolean,event): void {
    const clase = estado  ? 'exito' : 'error';
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
        this._service.activo(id,estado).then(resp =>{
          this._alcanosSnackbar.snackbar({ clase: 'exito', mensaje: '¡Perfecto! la operación se ha realizado exitosamente.', time: 6000 });
          this._service.getGastosViaje()
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
                this._alcanosSnackbar.snackbar({
                  clase: 'error',
                  mensaje: element,
                  time: 6000
                });
              });
            }
          }
        })
      }
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
      ['/novedades/gastos-viaje/'],
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
