import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ListarEditarService } from './listar-editar.service';
import { merge, Observable } from 'rxjs';
import {  map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { CrearConceptoComponent } from '../crear-concepto/crear-concepto.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FiltroConceptoComponent } from '../filtro-concepto/filtro-concepto.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-liquidaciones-listar-editar',
  templateUrl: './listar-editar.component.html',
  styleUrls: ['./listar-editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarEditarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  // Permisos
  arrayPermisosConceptos: any;

  dataLength: number | null;
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['conceptoNomina/codigo', 'conceptoNomina/nombre', 'conceptoNomina/orden', 'subPeriodo/nombre', 'tipoContrato/nombre', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // tslint:disable-next-line: no-input-rename
  @Input('tipo-liquidaciones') tipoLiquidacion: any;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-boton-crear') mostrarBtnCrear: boolean = true;


  dataRequest: boolean;

  selectedTab: number;

  constructor(
    private _service: ListarEditarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoLiquidacionConceptos_');
    this.dataRequest = true;

  }

  ngOnInit(): void {
    this._service.init(this.tipoLiquidacion.id);
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


  ngAfterViewInit(): void {
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

  limpiarHandle(event): void {
    const queryParams = {
      $filter: 'true'
    };
    this._service.buildFilter(queryParams);
  }

  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(FiltroConceptoComponent, {
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


  eliminarHandle(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarHandle(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.buildFilter({});
        });
      }
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }


  conceptoHandle(event): void {
    const dialogRef = this._matDialog.open(CrearConceptoComponent, {
      panelClass: 'modal-dialog',
      data: this.tipoLiquidacion,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this.selectedTab = 1;
        this._service.init(this.tipoLiquidacion.id);
      }
    });
  }



}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: ListarEditarService,
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
