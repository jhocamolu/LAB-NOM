import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CrearComponent } from '../crear/crear.component';
import { EditarComponent } from '../editar/editar.component';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'ayuda-categorias-listar',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, OnDestroy {

    dataRequest: boolean;
    dataSource: FilesDataSource | null;
    displayedColumns: string[] = ['nombre', 'orden', 'padre/nombre', 'estadoRegistro', 'acciones'];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // Permisos
    arrayPermisos: any;

    constructor(
        private _router: Router,
        private _service: ListarService,
        private _fuseSidebarService: FuseSidebarService,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _matDialog: MatDialog,
        private _permisos: PermisosrService
    ) {
        this.dataRequest = false;
        this.arrayPermisos = this._permisos.permisosStorage('Categorias_');
    }

    ngOnInit(): void {
        this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
        this._service.dataRequest.subscribe(
            (resp: boolean) => {
                this.dataRequest = resp;
            }
        );

        this.paginator.page.subscribe(
            (event: PageEvent) => {
                const skip = event.pageIndex * event.pageSize;
                this._router.navigate(
                    ['/ayuda/categorias'],
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
                    ['/ayuda/categorias'],
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

    limpiarHandle(event): void {
        this._router.navigate(
            ['/ayuda/categorias'],
            {
                queryParams: {
                    $filter: true
                },
                queryParamsHandling: 'merge',
            });
    }


    ngOnDestroy(): void {
        this.dataSource = null;
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
                    this._service.getCategorias();
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                }).catch((resp: HttpErrorResponse) => {
                    if (resp.status === 400) {
                        if ('id' in resp.error) {
                            let errors = '';
                            resp.error.id.forEach(element => {
                                errors += element;
                            });
                            this._alcanosSnackBar.snackbar({ clase: 'advertencia', time: 6000, mensaje: 'No se puede inactivar. Debe primero inactivar subcategorías de la categoría.' });
                        }
                    }
                });
            }
        });
    }

    filtroHandle(event): void {
        const dialogRef = this._matDialog.open(FiltroComponent, {
            panelClass: 'filtro-dialog',
            hasBackdrop: true,
            data: this._service.dataFilters
        });
        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined' && result != null) {
                this._service.dataFilters = result;
            }
        });
    }

    crearHandle(event): void {
        const dialogRef = this._matDialog.open(CrearComponent, {
            panelClass: 'crear-dialog',
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._service.getCategorias();
            }
        });
    }

    editarHandle(event, element): void {
        const dialogRef = this._matDialog.open(EditarComponent, {
            panelClass: 'editar-dialog',
            data: element,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._service.getCategorias();
            }

        });
    }

}

export class FilesDataSource extends DataSource<any>{

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
