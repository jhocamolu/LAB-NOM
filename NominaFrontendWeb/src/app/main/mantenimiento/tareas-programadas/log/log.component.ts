import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MatSort, MatPaginator, PageEvent } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogService } from './log.service';

@Component({
  selector: 'tareas-programadas-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class LogComponent implements OnInit, AfterViewInit, OnDestroy {

  log: any[] = [];

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['fechaCreacion', 'estado', 'resultado'];

  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;


  constructor(
    public dialogRef: MatDialogRef<LogComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _service: LogService
  ) {
    this.dataSource = null;
  }

  ngOnInit(): void {
    this._service.init(this.element.id);
    
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSource = new FilesDataSource(this._service, this.paginator);
      this.paginator.page.subscribe(
        (event: PageEvent) => {
          const skip = event.pageIndex * event.pageSize;
          this._service.buildFilter({
            $top: event.pageSize,
            $skip: skip,
          });
        }
      );
    });

  }

  ngOnDestroy(): void {
    this.dataSource = null;
    this._service.totalCount = 0;
    this._service.onLogChanged.next([]);
  }



  get dataLength(): number {
    return !this._service.totalCount ? 0 : this._service.totalCount;
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: LogService,
    private _matPaginator: MatPaginator,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onLogChanged,
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onLogChanged.value.slice();
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
