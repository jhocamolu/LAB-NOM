import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CrearComponent } from '../crear/crear.component';
import { EditarComponent } from '../editar/editar.component';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-embargos-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  // Permisos
  arrayPermisos: any;

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['tipoEmbargo/nombre', 'conceptoNominaId', 'estadoRegistro', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  form: FormGroup;
  dataRequest: boolean;

  constructor(
    private _service: ListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _router: Router,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('TipoEmbargos_');
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
          ['/configuracion/tipo-embargos'],
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
          ['/configuracion/tipo-embargos'],
          {
            queryParams: {
              $orderBy: orderBy,
            },
            queryParamsHandling: '',
          });
      }
    );
  }

  tipoEmbargo(id: number): any {
    this._service.getTipoEmbargoConceptoNominas(id).then(resp => {
      return resp;
    });
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
        `${this._service.dataFilters[key]}`.trim().length > 0) {
        i++;
      }
    }
    return i;
  }

  get hasFilter(): boolean {
    return this.filterSize > 0;
  }

  activarHandle(event, element): void {
    const id = element.tipoEmbargo.id;
    const estado = `${element.estadoRegistro}`.toLocaleLowerCase();
    const verboInverso = element.tipoEmbargo.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
    const clase = element.tipoEmbargo.estadoRegistro === 'Activo' ? 'error' : 'exito';
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
        clase: clase,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const bool = element.tipoEmbargo.estadoRegistro === 'Activo' ? false : true;
        this._service.activo(id, bool).then(result => {
          this._service.getTipoEmbargos();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
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

  urlLink(event): any {
    return this._router.navigate(['/configuracion/tipo-embargos/crear']);
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
      ['/configuracion/tipo-embargos'],
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

