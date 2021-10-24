import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
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
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'dependencias-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  // Permisos
  arrayPermisos: any;

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['codigo', 'nombre', 'dependencia', 'estadoRegistro', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  form: FormGroup;
  dataRequest: boolean;

  constructor(
    private _service: ListarService,
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Dependencias_');
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
          ['/configuracion/dependencias'],
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
          ['/configuracion/dependencias'],
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
        `${this._service.dataFilters[key]}`.trim().length > 0) {
        i++;
      }
    }
    return i;
  }

  get hasFilter(): boolean {
    return this.filterSize > 0;
  }

  activarHandle(error, element): void {
    const estado = `${element.dependenciaHijo.estadoRegistro}`.toLocaleLowerCase();
    const verboInverso = element.dependenciaHijo.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
    const clase = element.dependenciaHijo.estadoRegistro === 'Activo' ? 'error' : 'exito';
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
        clase: clase,
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const bool = element.dependenciaHijo.estadoRegistro === 'Activo' ? false : true;
        this._service.activo(element.dependenciaHijoId, bool).then(result => {
          this._service.getDependencias();
          this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['exito-snackbar'],
          });
        }
        ).catch((resp: HttpErrorResponse) => {
          if (resp.status === 400 && 'errors' in resp.error) {
            if ('id' in resp.error.errors) {
              let errors = '';
              resp.error.errors.id.forEach(element => {
                errors += element;
              });

              this._matSnackBar.open(errors, 'Aceptar', {
                verticalPosition: 'top',
                duration: 3000,
                panelClass: ['advertencia-snackbar'],
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
    this._router.navigate(
      ['/configuracion/dependencias'],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }

  crearHandle(event): void {
    const dialogRef = this._matDialog.open(CrearComponent, {
      panelClass: 'modal-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getDependencias();
      }
    });
  }

  editarHandle(event, element): void {
    const dialogRef = this._matDialog.open(EditarComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getDependencias();
      }
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
