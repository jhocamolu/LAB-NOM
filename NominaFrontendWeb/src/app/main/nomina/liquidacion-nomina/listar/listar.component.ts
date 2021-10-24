import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ListarService } from './listar.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'liquidacion-nomina-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, OnDestroy {

  // Permisos
  arrayPermisos: any;

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['tipoLiquidacion/nombre', 'tipoLiquidacion/tipoPeriodo/nombre', 'fechaInicio', 'fechaFinal', 'fechaAplicacion', 'estado', 'acciones'];

  estadoNomina = estadoNominaAlcanos;
  periodo: any;
  dataRequest: boolean;

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    private _router: Router,
    private _service: ListarService,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Nominas_');
    this.periodo = this._service.onPeriodoChanged.value;
    this.dataRequest = false;
  }

  ngOnInit(): void {
    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
    this.paginator.page.subscribe(
      (event: PageEvent) => {
        const skip = event.pageIndex * event.pageSize;
        this._router.navigate(
          ['/nomina/liquidacion-nomina'],
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
          ['/nomina/liquidacion-nomina'],
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

  crearHandle(event): void {
    this._router.navigate(
      ['/nomina/liquidacion-nomina/crear'],
    );
  }

  ngOnDestroy(): void {
    this.dataSource = null;
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
          const data = this._service.onItemsChanged.value.slice();
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


