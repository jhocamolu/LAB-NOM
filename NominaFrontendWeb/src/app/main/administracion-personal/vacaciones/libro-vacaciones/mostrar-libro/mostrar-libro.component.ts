import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { MostrarLibroService } from './mostrar-libro.service';
import { MostrarDetalleComponent } from '../mostrar-detalle/mostrar-detalle.component';

@Component({
  selector: 'vacaciones-mostrar-libro',
  templateUrl: './mostrar-libro.component.html',
  styleUrls: ['./mostrar-libro.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class MostrarLibroComponent implements OnInit, OnDestroy {


  dataSource: FilesDataSource | null;
  // tslint:disable-next-line: max-line-length
  displayedColumns: string[] = ['inicioCausacion', 'finCausacion', 'tipo', 'diasTrabajados', 'diasCausados', 'diasDisponibles', 'acciones'];

  items: any;
  contrato: any;
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  dataRequest: boolean;

  interrupcionesCount: number;
  interrupciones: any;

  constructor(
    private _service: MostrarLibroService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _router: Router,
    private _matDialog: MatDialog,
  ) {
    this.dataRequest = false;
  }

  ngOnInit(): void {
    this._service.onContratoChanged.subscribe(
      (resp: any) => {
        if(resp['@odata.count'] > 0){
          resp.value.forEach(element => {
            this.contrato = { funcionario: element.contrato.funcionario, iniciacion:element.inicioCausacion };
          });
        } else {
          this.contrato = null; 
        }
      }
    );
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
          [`vacaciones/libro/${this._service.id}/mostrar`],
          {
            queryParams: {
              $top: event.pageSize,
              $skip: skip,
            },
            queryParamsHandling: 'merge',
          });
      }
    );

    this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
  }

  get dataLength(): number {
    return this._service.totalCount;
  }

  mostrarHandle(event, element): void {
    const dialogRef = this._matDialog.open(MostrarDetalleComponent, {
      panelClass: 'modal-dialog900',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  ngOnDestroy(): void {
    this.dataSource = null;
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarLibroService,
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
          const data = this._service.onItemsChanged.value.slice();
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


