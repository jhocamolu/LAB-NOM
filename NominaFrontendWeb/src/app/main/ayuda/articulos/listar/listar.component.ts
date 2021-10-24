import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrearComponent } from '../crear/crear.component';
import { EditarComponent } from '../editar/editar.component';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'articulos-listar',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})

export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    dataSource: FilesDataSource | null;
    displayedColumns: string[] = ['orden', 'titulo', 'categoria/nombre', 'estadoRegistro', 'acciones'];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    dataRequest: boolean;

    // Permisos
    arrayPermisos: any;

    constructor(
        private _service: ListarService,
        private _fuseSidebarService: FuseSidebarService,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _matDialog: MatDialog,
        private _permisos: PermisosrService
    ) {
        this.dataRequest = false;
        this.arrayPermisos = this._permisos.permisosStorage('Articulos_');
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
                    ['/ayuda/articulos'],
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
                    ['/ayuda/articulos'],
                    {
                        queryParams: {
                            $orderBy: orderBy,
                        },
                        queryParamsHandling: '',
                    });
            }
        );

    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnDestroy(): void {
        this.dataSource = null;
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

    urlLink(event): any {
        return this._router.navigate(['/ayuda/articulos/crear']);
    }

    activarHandle(event, element): void {
        const estado = `${element.estadoRegistro}`.toLocaleLowerCase();
        const verboInverso = element.estadoRegistro === 'Activo' ? 'inactivarlo' : 'activarlo';
        const clase = element.estadoRegistro === 'Activo' ? 'error' : 'exito';
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: `El registro se encuentra ${estado}. ¿Estás seguro de ${verboInverso}?`,
                clase: clase,
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                const bool = element.estadoRegistro === 'Activo' ? false : true;
                this._service.activo(element.id, bool).then(result => {
                    this._service.getArticulos();
                    this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000,
                        panelClass: ['exito-snackbar'],
                    });
                });
            }
        });
    }

    filtroHandle(event): void {
        const dialogRef = this._matDialog.open(FiltroComponent, {
            panelClass: 'filtro-dialog',
            hasBackdrop: true,
            data: this._service.dataFilters,
        });
        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined' && result != null) {
                this._service.dataFilters = result;
            }
        });
    }

    limpiarHandle(event): void {
        this._router.navigate(
            ['/ayuda/articulos'],
            {
                queryParams: {
                    $filter: true
                },
                queryParamsHandling: 'merge',
            });
    }


    private actualizar(item: any): void {
        if (typeof item !== 'undefined' && item != null) {
            for (let i = 0; i < this._service.items.length; i++) {
                const element = this._service.items[i];
                if (element.id === item.id) {
                    this._service.items[i] = item;
                    this._service.onItemsChanged.next(this._service.items);
                }
            }
        }
    }
}

export class FilesDataSource extends DataSource<any>
{

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
