import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ListarService } from './listar.service';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { MostrarComponent } from '../mostrar/mostrar.component';
import { modulosCategoriaNovedades, modulosMCategoriaNovedades } from '@alcanos/constantes/categoria-novedades';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import * as moment from 'moment';

@Component({
  selector: 'categoria-novedades-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  // Permisos
  arrayPermisos: any;

  // modulos
  modulos = modulosCategoriaNovedades;
  moduloMostrar = modulosMCategoriaNovedades;
  mesPeriodoContable: any;
  anioPeriodoContable: any;
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['numeroDocumento', 'criterioBusqueda', 'anterior', 'actual', 'fechaInicio', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;
  displayElements: boolean;
  dataRequest: boolean;
  validar: any;
  constructor(
    private _router: Router,
    private _service: ListarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.displayElements = false;
    this.arrayPermisos = this._permisos.permisosStorage('ContratoCentroTrabajos_');
    //console.log( JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes('ContratoCentroTrabajos_')));
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
          ['/administracion-personal/cambio-centro-trabajos'],
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
          ['/administracion-personal/cambio-centro-trabajos'],
          {
            queryParams: {
              $orderBy: orderBy,
            },
            queryParamsHandling: '',
          });
      }
    );
  }



  invisible(date: any): boolean {
    const mesInsertado = moment(date).format('M');
    const anioInsertado = moment(date).format('YYYY');
    if (this.mesPeriodoContable !== mesInsertado || this.anioPeriodoContable !== anioInsertado) {
      return true;
    } else {
      return false;
    }
  }
  get dataLength(): number {
    return this._service.totalCount;
  }

  ngAfterViewInit(): void {
    this.displayElements = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }

  crearHandle(event): void {
    this._router.navigate(
      ['/administracion-personal/cambio-centro-trabajos/crear'],
    );
  }

  mostrarHandle(event, element): void {
    const dialogRef = this._matDialog.open(MostrarComponent, {
      panelClass: 'mostrar-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
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
      ['/administracion-personal/cambio-centro-trabajos'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }

}

export class FilesDataSource extends DataSource<any>{

  validate: any;
  total: any;
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
          this.validacion();
          this._matPaginator.pageSize = this._service.urlFilters['$top'];
          this._matPaginator.pageIndex = this._service.page;
          return this._service.items;
        }

        ));
  }

  async validacion() {
    let fechas: any = [];
    await this._service.getNominas().then(resp => {
      fechas = resp;
      this._service.items.forEach(ele => {
        let date1;
        let date2;
        let dateAValidar;
        ele['validates'] = true;
        fechas.map(element => {
          date1 = moment(element.fechaInicio).toDate();
          date2 = moment(element.fechaFinal).toDate();
          dateAValidar = moment(ele.fechaInicio).toDate();
          if(element.estado === 'Modificada' || element.estado === 'Liquidada' || element.estado === 'Aprobada' || element.estado === 'Aplicada'){
            if ((dateAValidar >= date1) && (dateAValidar <= date2)) {
              ele['validates'] = false;
            }
          }
        });
      });
    });
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}
