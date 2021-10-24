import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { AsociadosService } from './asociados.service';
@Component({
  selector: 'concepto-nominas-asociados',
  templateUrl: './asociados.component.html',
  styleUrls: ['./asociados.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class AsociadosComponent implements OnInit, OnDestroy {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['codigo', 'concepto'];

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @Input('concepto-nomina-id') id: any;

  @Input('concepto-nomina-agrupador') agrupador: any;

  dataRequest: boolean;

  constructor(
    private _service: AsociadosService,
  ) {
    this.dataRequest = false;

  }

  ngOnInit(): void {
    this._service.init(this.id, this.agrupador);
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



    this.dataSource = new FilesDataSource(this._service, this.paginator);
  }

  get dataLength(): number {
    return this._service.totalCount;
  }


  ngOnDestroy(): void {
    this.dataSource = null;
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: AsociadosService,
    private _matPaginator: MatPaginator
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onItemsChanged
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
