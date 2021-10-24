import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { ConceptoService } from './concepto.service';
import { CrearConceptoComponent } from '../crear-concepto/crear-concepto.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-ausentismos-concepto',
  templateUrl: './concepto.component.html',
  styleUrls: ['./concepto.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ConceptoComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  arrayPermisosConceptos: any;

  dataLength: number | null;
  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['conceptoNomina/nombre', 'coberturaDesde', 'coberturaHasta', 'acciones'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  // tslint:disable-next-line: no-input-rename
  @Input('tipo-ausentismo') itemTipoAsuntismo: any;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-boton-crear') mostrarBtnCrear: boolean = true;

  dataRequest: boolean;
  selectedTab: number;



  constructor(
    private _service: ConceptoService,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoAusentismoConceptoNominas_');
    this.dataRequest = true;
  }

  ngOnInit(): void {
    this._service.init(this.itemTipoAsuntismo.id);
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

    // this.paginator.page.subscribe(
    //   (event: PageEvent) => {
    //     const skip = event.pageIndex * event.pageSize;
    //     const queryParams = {
    //       $top: event.pageSize,
    //       $skip: skip,
    //     };
    //    // this._service.buildFilter(queryParams);
    //   }

    // );

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

  ngAfterViewInit(): void {
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
          this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['exito-snackbar'],
          });
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
      data: {
        element: this.itemTipoAsuntismo.id,
        accion : 'crear'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this.selectedTab = 1;
        this._service.init(this.itemTipoAsuntismo.id);

      }
    });
  }

  editarHandle(event, element): void {
    const dialogRef = this._matDialog.open(CrearConceptoComponent, {
      panelClass: 'modal-dialog',
      data: {
        element : element,
        accion : 'editar'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        
        this.selectedTab = 1;
        this._service.init(this.itemTipoAsuntismo.id);

      }
    });
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: ConceptoService,
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
          // this._matPaginator.pageSize = this._service.paginadorFilters['$top'];
          // this._matPaginator.pageIndex = this._service.page;
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

