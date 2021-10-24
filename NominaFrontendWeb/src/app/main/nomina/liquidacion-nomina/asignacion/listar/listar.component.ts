import { Component, OnInit, ViewEncapsulation, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, PageEvent, Sort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsignacionAgregarComponent } from '../agregar/agregar.component';
import { AsignacionService } from '../asignacion.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AsignacionFiltroComponent } from '../filtro/filtro.component';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'liquidacion-nomina-asignacion-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class AsignacionListarComponent implements OnInit {

  arrayPermisosFuncionarios: any;

  _this: AsignacionListarComponent;

  estadoLiquidacion = estadoNominaAlcanos;
  item: any;

  dataRequest: boolean;
  nomina: any;
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['numeroDocumento', 'primerNombre', 'cargoNombre', 'grupoNominaNombre', 'acciones'];
  newEstado: any;
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    private _router: Router,
    private _service: AsignacionService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _permisos: PermisosrService,
  ) {
    this._this = this;
    this.newEstado = this._service.estateRefresh.value;
    this.item = this._service.onItemChange.value;
    this.dataRequest = false;
    this.arrayPermisosFuncionarios = this._permisos.permisosStorage('NominaFuncionarios_', null, null, null, null, 'NominaFuncionarios_EliminarUno', null, null);
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
          [`nomina/liquidacion-nomina/${this.item.id}/asignacion`],
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
          [`nomina/liquidacion-nomina/${this.item.id}/asignacion`],
          {
            queryParams: {
              $orderBy: orderBy,
            },
            queryParamsHandling: '',
          });
      }
    );

    if (this._service.action === 'add') {
      this.agregarHandle(null);
    }
    if (this._service.action === 'clear') {
      this.limpiarNominaHandle(null);
    }
  }

  anterior(id: number): void {
    this._router.navigate([
      `/nomina/liquidacion-nomina/${this.item.id}/basica`],
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

  filtroHandle(event): void {
    const dialogRef = this._matDialog.open(AsignacionFiltroComponent, {
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

  limpiarHandle(event): void {
    this._router.navigate(
      [`nomina/liquidacion-nomina/${this.item.id}/asignacion`],
      {
        queryParams: {
          $filter: true
        },
        queryParamsHandling: 'merge',
      });
  }

  agregarHandle(event): void {
    const dialogRef = this._matDialog.open(AsignacionAgregarComponent, {
      panelClass: 'modal-dialog900',
      disableClose: true,
      data: this.item
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm === true) {
        this._service.getIdNomina(this.item.id).then(resp => {
          this.newEstado = resp;
        });
        this._service.refreshData(this.item.id);
      }
    });
  }

  limpiarNominaHandle(event): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro que quieres limpiar todos los funcionarios de la liquidación de la nómina?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.limpiarnomina(this.item.id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.refreshData(this.item.id);
          this._service.getIdNomina(this.item.id).then(resp => {
            this.newEstado = resp;
          });
        }, error => {
        });
      }
    });

  }

  eliminarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarAsignado(this.item.id, [element.id]).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.refreshData(this.item.id);
          this._service.getIdNomina(this.item.id).then(resp => {
            this.newEstado = resp;
          });
        }, error => {
        });
      }
    });

  }

}


export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: AsignacionService,
    private _matPaginator: MatPaginator,
    private _matSort: MatSort,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onAsignacionChange,
      this._matSort.sortChange
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onAsignacionChange.value.slice();
          this._matPaginator.pageSize = this._service.urlFilters['$top'];
          this._matPaginator.pageIndex = this._service.page;
          return data;
        }
        ));
  }


  disconnect(): void {
  }

}
