import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ConceptosListarService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { ConceptosFiltroComponent } from '../filtro/filtro.component';
import { ConceptosFormularioComponent } from '../formulario/formulario.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'distribucion-costos-conceptos-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ConceptosListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  // Permisos
  arrayPermisosCostos: any;


  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['municipio/divisionPoliticaNivel1Id', 'municipio/nombre', 'centroCosto/codigo', 'centroCosto/nombre', 'estadoRegistro', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-boton-crear') mostrarBtnCrear: boolean = true;

  @Input('actividadId') id: any;


  dataRequest: boolean;

  constructor(
    private _router: Router,
    private _service: ConceptosListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisosCostos = this._permisos.permisosStorage('ActividadCentroCostos_');
    if( this._router.url.includes('mostrar') ){
      this.arrayPermisosCostos['estadoRegistro'] = false;
    }
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


  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(ConceptosFiltroComponent, {
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


  // se comunica con el componente Crear
  cuentaHandle(event): void {
    const dialogRef = this._matDialog.open(ConceptosFormularioComponent, {
      panelClass: 'modal-dialog',
      data: {
        actividadId: this._service.id
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

  // se comunica con el componente Crear
  cuentaEditarHandle(event, element: any): void {
    const dialogRef = this._matDialog.open(ConceptosFormularioComponent, {
      panelClass: 'modal-dialog',
      data: element,
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

  activarHandle(event, element): void {
    const estado = `${element.estadoRegistro}`.toLocaleLowerCase();
    const verboInverso = element.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
    const clase = element.estadoRegistro === 'Activo' ? 'error' : 'exito';
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
        clase: clase,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const bool = element.estadoRegistro === 'Activo' ? false : true;
        this._service.activo(element.id, bool).then(result => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          const queryParams = {
            $filter: 'true'
          };
          this._service.buildFilter(queryParams);
        });
      }
    });
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: ConceptosListarService,
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
