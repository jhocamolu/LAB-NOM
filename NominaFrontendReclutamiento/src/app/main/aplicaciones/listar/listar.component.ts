import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { tipoGastoViaje, tipoGastoViajeMostrar } from '@alcanos/constantes/gasto-viajes';
import localeCo from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
import { FuseConfigService } from '@fuse/services/config.service';
import { CollectionViewer } from '@angular/cdk/collections';
import { DashboardService } from 'app/main/dashboard/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
registerLocaleData(localeCo, 'co')

@Component({
  selector: 'aplicaciones-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['requisicionPersonal/cargoDependenciaSolicitado/cargo/nombre', 'estado', 'requisicionPersonal/divisionPoliticaNivel2/nombre', 'fechaCreacion', 'accion'];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dataRequest: boolean;
  dataLength: any;
  submenu: string;
  loading: boolean = true;
  item: any = true;
  user:any;

  constructor(
    private _router: Router,
    private _fuseConfigService: FuseConfigService,
    private _service: ListarService,
    private _fuseSidebarService: FuseSidebarService,
    private _matDialog: MatDialog,
    private _alcanosSnackbar: AlcanosSnackBarService,
    private _dashboarService: DashboardService,
    private _cookieService: CookieService
  ) {
    // Configure the layout
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };
    this.dataRequest = false;
  }

  ngOnInit(): void {
    this._service.dataRequest.subscribe(
      (resp: boolean) => {
        this.dataRequest = resp;
      }
    );

    if (this._cookieService.check('User')) {
      let token = JSON.parse(this._cookieService.get('User')).token
      this.user = JSON.parse(atob(token.split('.')[1]))
      this.getAplicaciones()
    } else {
      this._router.navigate(['/logout'])
      return
    }
  }

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
  }


  ngOnDestroy(): void {
    // this.sort.sortChange.unsubscribe()
    this.dataLength = null
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

  cambiarEstadoRegistros(id: number, estado: boolean, event): void {
    const clase = estado ? 'exito' : 'error';
    const mensaje = estado ? 'El registro se encuentra inactivo ¿Estás seguro de activarlo?' : 'El registro se encuentra activo ¿Estás seguro de inactivarlo?'
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: mensaje,
        clase: clase,
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
      }
    });
  }

  getAplicaciones() {
    this.loading = true;
    this.item = true;
    this.dataSource = new FilesDataSource(this._service, this.user)
    this.dataSource.loadTable("fechaCreacion", 0, 5)
    this._service._getAplicaciones(this.user).subscribe((data =>{
      if(data['@odata.count'] > 0){
        this.dataSource['subject1'].subscribe(value => {
          if (Number(value) > 0) {
            this.loading = false;
            this.dataLength = value;
            this.item = true;
            // setTimeout(() => {
              if(value.length > 0){
              this.sort.sortChange.subscribe(() => this.paginator.pageIndex);
              merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                  tap(() => {
                    switch (this.sort.active) {
                      case 'requisicionPersonal/cargoDependenciaSolicitado/cargo/nombre': return this.loadPage('requisicionPersonal/cargoDependenciaSolicitado/cargo/nombre')
                      case 'estado': return this.loadPage('estado')
                      case 'requisicionPersonal/divisionPoliticaNivel2/nombre': return this.loadPage('requisicionPersonal/divisionPoliticaNivel2/nombre')
                      case 'fechaCreacion': return this.loadPage('fechaCreacion ' + this.sort.direction)
                      default: return 0;
                    }
                  })
                )
                .subscribe();
            // }, 200);
                }
          }
        })
      
      }else{
          this.loading = false;
          this.item = false;
          this.dataLength = null;
      }
    }))
  }

  loadPage(sort?: string) {
    if (!sort) {
      sort = 'fechaCreacion'
    }
    this.dataSource.loadTable(
      (this.sort.active + ' ' + this.sort.direction),
      this.paginator.pageSize * this.paginator.pageIndex,
      this.paginator.pageSize,
    );
  }

  aplicarConvocatoria(event): void
    {   
        this._dashboarService.onFilterChanged.next('convocatorias');
        this._dashboarService.onFilterSubChanged.next('');
        this._dashboarService.nextItem(null)
    }

  changeMenu(menu,item): void {
    this.submenu = menu;
    this._dashboarService.onFilterSubChanged.next(this.submenu);
    // this._dashboarService.itemChange.subscribe(item => this.item = item)
    this._dashboarService.nextItem(item)
  }

  eliminarAplicacion(dato){
    this.loading = true;
    this._service.eliminarAplicacion(dato).then(data => {
      this.getAplicaciones()
      this._alcanosSnackbar.snackbar({ clase: 'exito', mensaje: 'Has eliminado la aplicación a la convocatoria con exito.', time: 6000 });
    })
  }
}

export class FilesDataSource implements DataSource<any> {

  private Subject = new BehaviorSubject<any[]>([]);
  private subject1 = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private _listService: ListarService, private data:any) { }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.Subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.Subject.complete();
    this.loadingSubject.complete();
  }

  loadTable(orderBy: string, skip: number = 0,
    top: number = 5) {

    this.loadingSubject.next(true);

    this._listService._getAplicaciones(this.data,orderBy, skip, top).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(provinces => {
        this.Subject.next(provinces['value']);
        this.subject1.next(provinces['@odata.count']);
      });
  }
}
