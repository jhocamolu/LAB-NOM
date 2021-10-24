import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, PageEvent, Sort, MatSnackBar } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { NovedadesService } from './novedades.service';
import { FiltroNovedadesComponent } from './filtro-novedades/filtro-novedades.component';
import { FormularioComponent } from './formulario/formulario.component';
import * as moment from 'moment';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import localeCo from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeCo, 'co');
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'liquidacion-nomina-novedades',
  templateUrl: './novedades.component.html',
  styleUrls: ['./novedades.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class NovedadesComponent implements OnInit {

  // Permisos
  arrayPermisosDetalle: any;
  loadTable: boolean;
  item: any;
  estadoNomina = estadoNominaAlcanos;
  dataRequest: boolean;
  newEstado: any; 
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['nominaFuncionario/funcionario/numeroDocumento', 'primerNombre', 'nominaFuenteNovedad/modulo', 'unidadMedida', 'cantidad', 'valor', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _service: NovedadesService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _permisos: PermisosrService,
  ) {
    this.item = this._service.item;
    this.newEstado = {estado: null}
    this.dataRequest = false;
    this.loadTable = false;
    this.arrayPermisosDetalle = this._permisos.permisosStorage('NominaDetalles_');
  }

  ngOnInit(): void {

    this._service.getIdNomina(this.item.id).then(resp => {
      this.newEstado = resp; 
    });
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
          [`nomina/liquidacion-nomina/${this.item.id}/novedades`],
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
          [`nomina/liquidacion-nomina/${this.item.id}/novedades`],
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

  filtroNovedadHandle(event): void {
    const dialogRef = this._matDialog.open(FiltroNovedadesComponent, {
      panelClass: 'filtro-dialog',
      hasBackdrop: true,
      data: {
        item: this.item,
        url: this._service.dataFilters
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {

    });
  }

  eliminarHandle(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Está seguro que quiere eliminar esta novedad del detalle de la nómina?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarHandle(id).then(result => {
          // this.actualizar(result);
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._router.routeReuseStrategy.shouldReuseRoute = () => false;
          this._router.onSameUrlNavigation = 'reload';
          this._service.getIdNomina(this.item.id).then(resp => {
            this.newEstado = resp; 
          });
          this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/novedades`], {
            queryParams: {
              updated: moment(),
            }
          });
        });
      }
    });
  }



  editarHandle(event, element): void {
    const dialogRef = this._matDialog.open(FormularioComponent, {
      panelClass: 'modal-dialog',
      data: element,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this._service.getIdNomina(this.item.id).then(resp => {
        this.newEstado = resp; 
      });

      this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/novedades`], {
        queryParams: {
          updated: moment(),
        }
      });
    });
  }


  limpiarHandle(event): void {
    this._router.navigate(
      [`nomina/liquidacion-nomina/${this.item.id}/novedades`],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }

  actualizarNovedad(){
    this.loadTable = true;
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this._router.onSameUrlNavigation = 'reload';
    this._router.navigate([`/nomina/liquidacion-nomina/${this.item.id}/novedades`], {
      queryParams: {
        updated: moment(),
      },
    }).then(result =>{
      this.loadTable = false;
    });
    this._service.getIdNomina(this.item.id).then(resp => {
      this.newEstado = resp; 
    });
  }

}


export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: NovedadesService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onNovedadesChange,
      this._matSort.sortChange
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onNovedadesChange.value.slice();
          this._matPaginator.pageSize = this._service.urlFilters['$top'];
          this._matPaginator.pageIndex = this._service.page;
          return data;
        }
        ));
  }


  disconnect(): void {
  }

}

