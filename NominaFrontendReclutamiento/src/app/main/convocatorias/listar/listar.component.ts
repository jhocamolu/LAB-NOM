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
  selector: 'convocatorias-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['cargoDependenciaSolicitado/cargo/nombre', 'divisionPoliticaNivel2/nombre', 'cantidad', 'salario', 'accion'];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dataRequest: boolean;
  dataLength: any;
  submenu: string;
  loading: boolean = true;
  item: any;
  load: boolean = true;
  user: any;

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
      this.getConvocatorias()
    } else {
      this._router.navigate(['/logout'])
      return
    }
    // console.log(this.dataSource)
    // this.paginator.page.subscribe(
    //   (event  : PageEvent) => {
    //     const skip = event.pageIndex * event.pageSize;
    //     this._router.navigate(
    //       ['/convocatorias'],
    //       {
    //         queryParams: {
    //           $top: event.pageSize,
    //           $skip: skip,
    //         },
    //         queryParamsHandling: 'merge',
    //       });
    //   }
    // );

    // this.sort.sortChange.subscribe(
    //   (event: Sort) => {
    //     const orderBy = `${event.active} ${event.direction}`;
    //     this._router.navigate(
    //       ['/convocatorias'],
    //       {
    //         queryParams: {
    //           $orderBy: orderBy,
    //         },
    //         queryParamsHandling: '',
    //       });
    //   }
    // );
  }

  ngAfterViewInit(): void { }

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

  cambiarEstadoRegistros(id: number, estado: boolean, event): void {
    const clase = estado ? 'exito' : 'error';
    const mensaje = estado ? 'El registro se encuentra inactivo ??Est??s seguro de activarlo?' : 'El registro se encuentra activo ??Est??s seguro de inactivarlo?'
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

  getConvocatorias() {
    this.dataLength = null;
    this.loading = true;
    this.item = true;
    let idConvocatorias = []
    let idAplicaciones = []
    this.dataSource = new FilesDataSource(this._service)
    this.dataSource.loadConvocatorias("fechaInicio", 0, 5)
    this._service._getConvocatorias().subscribe(dataConvocatoria =>{
      if(dataConvocatoria['@odata.count'] > 0){
        this._service._getAplicaciones(this.user).subscribe(dataAplicaciones =>{
          if(dataConvocatoria['@odata.count'] > 0){
            dataConvocatoria['value'].forEach(element => {
              idConvocatorias.push(element.id)
            });
  
  
            if(dataAplicaciones['@odata.count'] > 0){
              dataAplicaciones['value'].forEach(element => {
                idAplicaciones.push(element.requisicionPersonalId)
              });
            }
            if(this.dataSource){
              this.dataSource['convocatoriasSubject'].subscribe(value => {
                idAplicaciones.forEach(apli => {
                  this.dataSource['convocatoriasSubject']['_value'] = this.dataSource['convocatoriasSubject']['_value'].filter(data => data.id !== apli)
                  this.dataSource['convocatoriasSubject1']['_value'] = this.dataSource['convocatoriasSubject']['_value'].length
                })
              });

              this.dataSource['convocatoriasSubject1'].subscribe(value => {
                if (Number(value) > 0) {
                  this.loading = false;
                  this.dataLength = value;
                  this.load = true;
                  if(value.length > 0){
                    this.sort.sortChange.subscribe(() => this.paginator.pageIndex);
                    merge(this.sort.sortChange, this.paginator.page)
                      .pipe(
                        tap(() => {
                          switch (this.sort.active) {
                            case 'fechaInicio': return this.loadProvincesPage('fechaInicio ' + this.sort.direction)
                            case 'cargoDependenciaSolicitado/cargo/nombre': return this.loadProvincesPage('cargoDependenciaSolicitado/cargo/nombre')
                            case 'divisionPoliticaNivel2/nombre': return this.loadProvincesPage('divisionPoliticaNivel2/nombre')
                            case 'cantidad': return this.loadProvincesPage('cantidad')
                            case 'salario': return this.loadProvincesPage('salario')
                            default: return 0;
                          }
                        })
                      )
                      .subscribe();
                  }
                }else{
                  this.loading = false;
                  this.dataLength = null
                  this.load = false;
                }
          
              })
            }
            
  
          }else{
            this.loading = false;
            this.dataLength = null
            this.load = false;
          }
        });
      }
      
    });
  }

  loadProvincesPage(sort?: string) {
    if (!sort) {
      sort = 'fechaInicio'
    }
    this.dataSource.loadConvocatorias(
      (this.sort.active + ' ' + this.sort.direction),
      this.paginator.pageSize * this.paginator.pageIndex,
      this.paginator.pageSize,
    );
  }

  changeMenu(menu,item): void {
    this.submenu = menu;
    this._dashboarService.onFilterSubChanged.next(this.submenu);
    this._dashboarService.itemChange.subscribe(item => this.item = item)
    this._dashboarService.nextItem(item)
  }
}

export class FilesDataSource implements DataSource<any> {

  private convocatoriasSubject = new BehaviorSubject<any[]>([]);
  private convocatoriasSubject1 = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private _listService: ListarService) { }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.convocatoriasSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.convocatoriasSubject.complete();
    this.loadingSubject.complete();
  }

  loadConvocatorias(orderBy: string, skip: number = 0,
    top: number = 5) {

    this.loadingSubject.next(true);

    this._listService._getConvocatorias(orderBy, skip, top).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(provinces => {
        this.convocatoriasSubject.next(provinces['value']);
        this.convocatoriasSubject1.next(provinces['@odata.count']);
      });
  }
}
