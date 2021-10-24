import { Component, OnInit, ViewEncapsulation, ViewChild, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatPaginator, MatSort, MatSnackBar, MatDialog, PageEvent, Sort, MatMenuTrigger } from '@angular/material';
import { Observable, merge } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { map } from 'rxjs/operators';
import { ListarService } from './listar.service';
import { FiltroComponent } from '../filtro/filtro.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
  selector: 'plantilla-documentos-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['nombre', 'grupoDocumentoId', 'fechaVigencia', 'estadoRegistro', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  dataRequest: boolean;

  grupos: any[];

  // Permisos
 arrayPermisos:any;

  constructor(
    private _service: ListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService
  ) {
    this.dataRequest = false;
    this.grupos = this._service.onGruposChanged.value.sort(function (a, b) {
      if (a.nombre < b.nombre) { return -1; }
      if (a.nombre > b.nombre) { return 1; }
      return 0;
    });;

    this.arrayPermisos = this._permisos.permisosStorage('Plantillas_');
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
        this._router.navigate(['/plantilla/documentos'],
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
        this._router.navigate(['/plantilla/documentos'],
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

  ngOnDestroy(): void {
    this.dataSource = null;
  }

  triggerLink(): void {
    this.trigger.openMenu();
  }


  urlLink(event): any {
    this._router.navigate(['/']);
  }
  
  get filterSize(): number {
    let i = 0;
    for (const key in this._service.dataFilters) {
      if (this._service.dataFilters.hasOwnProperty(key)
        && this._service.dataFilters[key] != null
        && `${this._service.dataFilters[key]}`.length > 0) {
        i++;
      }
    }
    return i;
  }

  get hasFilter(): boolean {
    return this.filterSize > 0;
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
        this._service.activo(element.id, bool)
          .then(result => {
            this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
              verticalPosition: 'top',
              duration: 3000,
              panelClass: ['exito-snackbar'],
            });
            this._service.getDocumentos();
          }).catch((resp: HttpErrorResponse) => {
            if (resp.status === 400 && 'errors' in resp.error) {
              if ('id' in resp.error.errors) {
                let errors = '';
                resp.error.errors.id.forEach(element => {
                  errors += element;
                });

                this._matDialog.open(AlcanosDialogComponent, {
                  disableClose: false,
                  data: {
                    mensaje: errors,
                    clase: 'error',
                  }
                });
              }
            }
          });
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
    this._router.navigate(['/plantilla/documentos'],
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
