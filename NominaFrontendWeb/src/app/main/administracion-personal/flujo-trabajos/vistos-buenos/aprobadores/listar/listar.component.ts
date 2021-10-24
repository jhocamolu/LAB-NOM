import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AprobadoresFiltroComponent } from '../filtro/filtro.component';
import { AprobadoresFormularioComponent } from '../formulario/formulario.component';
import { AprobadorMostrarComponent } from '../mostrar/mostrar.component';
import { AprobadoresListarService } from './listar.service';
import { FormularioComponent } from '../../formulario/formulario.component';

@Component({
  selector: 'aprobaciones-aprobadores-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class AprobadoresListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['cargoDependenciaIndependiente/dependencia/nombre', 'cargoDependenciaIndependiente/cargo/nombre', 'centroOperativoIndependiente/nombre', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // tslint:disable-next-line: no-input-rename
  @Input('aprobadores-id') id: any;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-boton-crear') mostrarBtnCrear: boolean = true;

  dataRequest: boolean;
  selectedTab: number;


  constructor(
    private _service: AprobadoresListarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    public _formularioCompoenent :FormularioComponent
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
    const dialogRef = this._matDialog.open(AprobadoresFiltroComponent, {
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

  aprobadorHandle(event,element?): void {
    const dialogRef = this._matDialog.open(AprobadoresFormularioComponent, {
      panelClass: 'modal-dialog',
      data: {
        // envio el formulario de informacion, debido a que si el usuario no le da guardar en el primera pestaña, al guardar los cambios aqui
        // estos no se pierdan
        aplicacioneExterna:element,
        aplicacionExternaId: this._service.id
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

  aprobadorEditarHandle(event, element: any): void {
    const dialogRef = this._matDialog.open(AprobadoresFormularioComponent, {
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

  mostrarAprobadorHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobadorMostrarComponent, {
      panelClass: 'mostrar-dialog',
      width:'800px',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
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

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: AprobadoresListarService,
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
