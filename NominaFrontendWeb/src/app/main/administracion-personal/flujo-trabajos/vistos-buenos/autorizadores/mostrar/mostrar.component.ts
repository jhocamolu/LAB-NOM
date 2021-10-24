import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { AutorizadoresListarService } from '../listar/listar.service';
import { MatPaginator, MatSort, PageEvent, Sort } from '@angular/material';
import { AutorizadoresMostrarService } from './mostrar.service';
import { DataSource } from '@angular/cdk/table';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'aprobaciones-autorizaciones-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AutorizadorMostrarComponent implements OnInit {

  dataSource: FilesDataSource | null;
  displayedColumns: string[] = ['cargoDependencia/dependencia/nombre', 'cargoDependencia/cargo/nombre', 'aplicacionExternaCargo/aplicacionExternaCargo/centroOperativoDependiente/nombre'];

  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  
  dataRequest: boolean;
  item: any;

  constructor(
    private _service: AutorizadoresMostrarService,
    public dialogRef: MatDialogRef<AutorizadorMostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private cd: ChangeDetectorRef
  ) { 
    this.dataRequest = false;
  }

  ngOnInit(): void {
    this._service.init(this.element.id);
    this._service.dataRequest.subscribe(
      (resp: boolean) => {
        this.dataRequest = resp;
      }
    );
  }

  //despues de la vista, carga la paginate y el sort, al final se llama detectChanges, para que me detecte los cambios que se realicen
  ngAfterViewInit(): void {
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
    this.cd.detectChanges();
  }

  get dataLength(): number {
    return this._service.totalCount;
  }

}

export class FilesDataSource extends DataSource<any>{

  constructor(
    private _service: AutorizadoresMostrarService,
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