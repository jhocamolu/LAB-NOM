import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarEditarService } from './listar-editar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { FiltroEditarComponent } from '../destinatarios-filtro/filtro.component';
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { DestinatarioCrearComponent } from '../destinatario-crear/crear-destinatario.component';


@Component({
  selector: 'destinatarios-listar-editar',
  templateUrl: './listar-editar.component.html',
  styleUrls: ['./listar-editar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarEditarComponent implements OnInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['funcionario/criterioBusqueda', 'estado', 'fechaCreacion', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  @Input('destinatario-id') id: any;

  dataRequest: boolean;

  constructor(
    private _router: Router,
    private _service: ListarEditarService,
    private _fuseSidebarService: FuseSidebarService,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
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
        const skip = event.pageIndex * event.pageSize;
        const queryParams = {
          $top: event.pageSize,
          $skip: skip,
        };
        this._service.buildFilter(queryParams);
      }
    );

    this.sort.sortChange.subscribe(
      (event: Sort) => {
        const orderBy = `${event.active} ${event.direction}`;
        const queryParams = {
          $orderBy: orderBy,
        };
        this._service.buildFilter(queryParams);
      }
    );

    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
  }

  get dataLength(): number {
    return this._service.totalCount;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }


   // se comunica con el componente Dependencia
   destinatarioHandle(event): void {
    const dialogRef = this._matDialog.open(DestinatarioCrearComponent, {
      panelClass: 'crear-dialog',
      data: { id: this._service.id },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this._service.getDestinatarios();
      if (typeof result !== 'undefined' && result != null) {
        this._service.getDestinatarios();
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
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

  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(FiltroEditarComponent, {
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
      $filter: "true"
    };
    this._service.buildFilter(queryParams);
  }


  public deleteRequisito(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.borrar(id).then(() => {
          this._service.getDestinatarios();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
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
