import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ListarService } from './listar.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MostrarComponent } from '../mostrar/mostrar.component';
import { DataSource } from '@angular/cdk/table';
import { FiltroComponent } from '../filtro/filtro.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { CrearComponent } from '../crear/crear.component';
import { EditarComponent } from '../editar/editar.component';
import { tipoHoraExtraMostrar, tipoHoraExtra, estadoHoraExtra } from '@alcanos/constantes/tipo-hora-extra';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AlcanosDialogComponent } from '@alcanos/components/dialog/dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'hora-extras-listar',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    horaExtra = tipoHoraExtra;
    horaExtraM = tipoHoraExtraMostrar;
    estadoHoraExtra = estadoHoraExtra;

    dataSource: FilesDataSource | null;
    displayedColumns: string[] = ['funcionario/numeroDocumento', 'funcionario/criterioBusqueda', 'tipoHoraExtra', 'fecha', 'cantidad', 'estado', 'estadoRegistro', 'acciones'];

    item: any;
    dataRequest: boolean;

    // Permisos
    arrayPermisos: any;
    timers: boolean;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;
    espera: boolean; 

    constructor(
        public dialogRef: MatDialogRef<ListarComponent>,
        @Inject(MAT_DIALOG_DATA) public element: any,
        private _router: Router,
        private _matSnackBar: MatSnackBar,
        private _service: ListarService,
        private _matDialog: MatDialog,
        private _permisos: PermisosrService,
        private _alcanosSnackBar: AlcanosSnackBarService,
    ) {
        this.espera = false;
        this.dataRequest = false;
        this.arrayPermisos = this._permisos.permisosStorage('HoraExtras_');
    }

    ngOnInit(): void {
        this._service.onItemsChanged.subscribe(
            (resp) => {
                this.item = resp;
            }
        );
        this.dataSource = new FilesDataSource(this._service, this.paginator, this.sort);
        this.paginator.page.subscribe(
            (event: PageEvent) => {
                const skip = event.pageIndex * event.pageSize;
                this._router.navigate(
                    ['/novedades/hora-extras'],
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
                    ['/novedades/hora-extras'],
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

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnDestroy(): void {
        this.dataSource = null;
    }

    preload(): void {
        
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: ` ¿Estás seguro de importar estos registros?`,
                clase: 'advertencia',
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.espera = true;  
                this._alcanosSnackBar.snackbar({
                    clase: 'advertencia',
                    mensaje: 'Estamos procesando esta información',
                    time: 2000
                });
                              
                this._service.importar()
                    .then((resp) => {
                        if (resp == null) {
                            this._alcanosSnackBar.snackbar({ clase: 'exito' });
                        }
                        this.espera = false;
                        this.dialogRef.close(true);
                    }).catch((resp: HttpErrorResponse) => {
                        let mensaje = 'Se ha presentado un error en el servidor.';
                        if (resp.status === 400) {
                            mensaje = 'Se ha presentado un error al procesar el formulario.';
                            this._alcanosSnackBar.snackbar({
                                clase: 'error',
                                mensaje: mensaje,
                                time: 2000
                            });
                        }

                        this.espera = false;
                        let error = resp.error;
                        if (typeof resp.error === 'string') {
                            error = JSON.parse(resp.error);
                        } else {
                            error = resp.error;
                        }
                        if (resp.status === 400 && 'errors' in error) {
                            if ('snack' in error.errors) {
                                const errors = {};
                                error.errors.snack.forEach(element => {
                                    this._alcanosSnackBar.snackbar({
                                        clase: 'error',
                                        mensaje: element,
                                        time: 6000
                                    });
                                });
                            }

                        }
                    });
            }
        });
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
                    this._service.getHoraExtras();
                    this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
                        verticalPosition: 'top',
                        duration: 3000,
                        panelClass: ['exito-snackbar'],
                    });
                });
            }
        });
    }

    crearHandle(event): void {
        const dialogRef = this._matDialog.open(CrearComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this._service.getHoraExtras();
            }
        });
    }

    editarHandle(event, element): void {
        const dialogRef = this._matDialog.open(EditarComponent, {
            panelClass: 'modal-dialog',
            data: element,
            disableClose: true,

        });
        dialogRef.afterClosed().subscribe(result => {
            this._service.getHoraExtras();
        });
    }

    mostrarHandle(event, elment): void {
        const dialogRef = this._matDialog.open(MostrarComponent, {
            panelClass: 'modal-dialog',
            disableClose: false,
            data: elment
        });
        dialogRef.afterClosed().subscribe(result => { });
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

    limpiarHandle(event): void {
        this._router.navigate(
            ['/novedades/hora-extras'],
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
