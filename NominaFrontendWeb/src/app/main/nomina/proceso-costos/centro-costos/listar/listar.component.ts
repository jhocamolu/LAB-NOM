import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { CentroCostosListarService } from './listar.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { CentroCostosFiltroComponent } from '../filtro/filtro.component';

@Component({
  selector: 'centro-costos-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class CentroCostosListarComponent implements OnInit, AfterViewInit, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['actividadCentroCosto/centroCosto/nombre', 'cantidad', 'porcentaje', 'fechaCorte'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // Permisos
  arrayPermisos: any;

  @Input('actividades-id') id: any;
  @Input('permiso') permisos: any;


  dataRequest: boolean;

  constructor(
    private _service: CentroCostosListarService,
    private _matDialog: MatDialog
  ) {
    this.dataRequest = false;
  }

  ngOnInit(): void {

    this._service.init(this.id);
    this._service.dataRequest.subscribe(
      (resp: boolean) => {
        this.dataRequest = resp;
      }
    );


    this.paginator.page.subscribe(
      (event: PageEvent) => {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const skip = event.pageIndex * event.pageSize;
        const queryParams = {
          $top: event.pageSize,
          $skip: skip,
          $filter: toUrlEncoded(this._service.dataFilters)
        };
        this._service.buildFilter(queryParams);
      }
    );

    this.sort.sortChange.subscribe(
      (event: Sort) => {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

        const orderBy = `${event.active} ${event.direction}`;
        const queryParams = {
          $orderBy: orderBy,
          $filter: toUrlEncoded(this._service.dataFilters)
        };
        this._service.buildFilter(queryParams);
      }
    );

    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
  }

  get dataLength(): number {
    return this._service.totalCount;
  }

  ngAfterViewInit(): void {
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


  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(CentroCostosFiltroComponent, {
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
    const queryParams = {
      $filter: 'true'
    };
    this._service.buildFilter(queryParams);
  }
}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: CentroCostosListarService,
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
