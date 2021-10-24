import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActividadesListarFuncionarioService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/table';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { FormularioActividadFuncionarioComponent } from '../formulario-funcionario/formulario.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';



@Component({
    selector: 'actividades-listar-funcionario',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ActividadesListarFuncionarioComponent implements OnInit, OnDestroy {

    dataSource: FilesDataSource | null;
    displayedColumns: string[] = ['actividadCentroCosto/centroCosto/nombre', 'porcentaje', 'fechaCorte', 'acciones'];
    datos: any;


    // Permisos
    arrayPermisos: any;
    datosUrl: any;
    espera: any;
    validado: boolean;
    sendComplete: boolean;
    dataRequest: boolean;
    visible: boolean = false;

    constructor(
        private _service: ActividadesListarFuncionarioService,
        private _matDialog: MatDialog,
        private _permisos: PermisosrService,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _router: Router
    ) {
        this.arrayPermisos = this._permisos.permisosStorage('FuncionarioCentroCostos_', null, 'FuncionarioCentroCostos_CrearManual');
        this.dataRequest = false;
        this.datosUrl = this._service.urlFilters;
        this.espera = false;
        this.visible = this._service.visible;

        if (this._service.visible) {
            this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No puede ingresar a este espacio sin haber incluido correctamete los datos de acceso' });
            this._router.navigate(['/nomina/proceso-costos/']);
        }
    }

    ngOnInit(): void {
        this.datos = this._service.items;
        this._service.dataRequest.subscribe(
            (resp: boolean) => {
                this.dataRequest = resp;
            }
        );
        this.validarItem(true);

        this.dataSource = new FilesDataSource(this._service);
    }

    get dataLength(): number {
        return this._service.totalCount;
    }

    validarDatosOfId(data): string {
        if (data != null) {
            if (data > 1000000) {
                return 'localstorage';
            } else {
                return 'bd';
            }
        }
    }

    validateCarga(): boolean {
        if (JSON.parse(localStorage.getItem('carga')) != null) {
            return true;
        } else {
            return false;
        }
    }



    validarItem(validado: boolean = null): void {
        if (JSON.parse(localStorage.getItem('carga')) != null) {
            let percent = 0;
            JSON.parse(localStorage.getItem('carga')).forEach(element => {
                percent += Number(element.porcentaje);
            });
            percent = percent % 1 == 0 ? Number(percent) : Number(percent * 100);
            this.sendComplete = percent == 100 ? true : false;
            this.validado = percent < 100 ? true : false;
        }
        if (validado != null) {
            this.validado = validado;
        }
    }

    cerrar(event): void {
        const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
            disableClose: false,
            data: {
                mensaje: `¿Está seguro que desea cancelar el registro de la información?`,
                clase: `advertencia`,
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                localStorage.removeItem('bd');
                localStorage.removeItem('usuario');
                localStorage.removeItem('carga');
                localStorage.removeItem('editado');
                this._service.items = [];
                this._service.totalCount = 0;
                this._router.navigate(['/nomina/proceso-costos/']);
            }
        });
    }

    crearHandle(event, element): void {
        const dialogRef = this._matDialog.open(FormularioActividadFuncionarioComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
            data: { id: null, informacion: element, url: this.datosUrl, items: null }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.validarItem(null);
            this._service.getFuncionarioCentroCostos();
        });
    }


    borrarHandle(event, dato): void {
        if (dato.formaRegistro == 'Storage') {
            console.log(Number(dato.id) <= 100000);
            if (Number(dato.id) >= 100000) {
                const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
                    disableClose: false,
                    data: {
                        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
                        clase: 'error',
                    }
                });
                dialogRef.afterClosed().subscribe(confirm => {
                    if (confirm) {
                        this._service.borrar(dato).then(resp => {
                        }).catch(e => {
                            (e[0] == 'Borrado totalmente') ? this._alcanosSnackBar.snackbar({ clase: 'exito' }) : this._alcanosSnackBar.snackbar({ clase: 'exito' });
                        });
                        this.validarItem(null);
                        this._service.getFuncionarioCentroCostos();
                    }
                });
            } else {
                this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No se puede borrar un centro de costo que ha sido guardado previamente.' });
            }
        }
    }


    editarHandle(event, dato): void {
        if (dato.formaRegistro == 'Manual' || dato.formaRegistro == 'Storage') {
            const dialogRef = this._matDialog.open(FormularioActividadFuncionarioComponent, {
                panelClass: 'modal-dialog',
                disableClose: true,
                data: { id: dato.id, informacion: dato, url: this.datosUrl, items: this.datos }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.espera = false;
                    this.validarItem(null);
                    this._alcanosSnackBar.snackbar({ clase: 'exito' });
                    this._service.getFuncionarioCentroCostos();
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.dataSource = null;
        this.espera = false;
        this.datos = null;
        this.datosUrl = null;
        this._service.onItemsChanged.next({});
        localStorage.removeItem('bd');
        localStorage.removeItem('usuario');
        localStorage.removeItem('carga');
        localStorage.removeItem('editado');
    }

    // Construye el objeto completo a enviar
    enviarCompleto(): void {

        if (this.sendComplete) {

            this.espera = true;
            let aBody = [];
            let final = [];
            let id = 0;
            if (JSON.parse(localStorage.getItem('carga')) != null) {
                let validacionCompleto = 0;
                JSON.parse(localStorage.getItem('carga')).forEach(element => {
                    validacionCompleto += Number(element.porcentaje);
                });
                if (validacionCompleto == 100) {


                    JSON.parse(localStorage.getItem('carga')).forEach(element => {
                        aBody.push({
                            actividadCentroCostoId: element.actividadCentroCostoId,
                            porcentaje: element.porcentaje % 1 == 0 ? Number(element.porcentaje) : element.porcentaje
                        });
                    });

                    JSON.parse(localStorage.getItem('carga')).map(resp => {
                        id = resp.id;
                        final.push({
                            tipoDistribucion: 'Funcionario',
                            funcionarioId: Number(this.datosUrl.funcionarioId),
                            cargoId: null,
                            centroOperativoId: null,
                            fechaCorte: resp.fechaCorte,
                            listaFucnionariosCentroCosto: aBody,
                        });
                    });
                    if (JSON.parse(localStorage.getItem('editado'))) {
                        if (localStorage.getItem('bd') == "true") {
                            this.guardarenPost(final[0], Number(this.datosUrl.funcionarioId));
                        } else {
                            this.guardarenPost(final[0], null);
                        }
                    } else {
                        this.guardarenPost(final[0], null);
                    }
                } else {
                    this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible incluir datos inferiores/superiores a un 100% por favor revise' });
                    this.validarItem(null);
                    this.espera = false;
                }
            }
        }
    }

    // Toma el objeto creado y o envia por http
    guardarenPost(formValue, id) {
        this._service.crear(formValue, id)
            .then((resp) => {
                this.espera = false;
                this.validarItem(null);
                localStorage.removeItem('bd');
                localStorage.removeItem('usuario');
                localStorage.removeItem('carga');
                localStorage.removeItem('editado');

                this._alcanosSnackBar.snackbar({ clase: 'exito' });

                this._service.getFuncionarioCentroCostos();
                //this._router.navigate([`/nomina/proceso-costos/${this.datosUrl.funcionarioId}/generar-manualmente-funcionario`]);

            }).catch((resp: HttpErrorResponse) => {

                this.validarItem(null);
                this.espera = false;
                let error = resp.error;
                if (typeof resp.error === 'string') {
                    error = JSON.parse(resp.error);
                } else {
                    error = resp.error;
                }

                if (resp.status === 400 && 'errors' in error) {
                    if ('snack' in error.errors) {
                        let msg = '';
                        error.errors.snack.forEach(element => {
                            msg = element;
                        });
                        this._alcanosSnackBar.snackbar({
                            clase: 'error',
                            mensaje: msg,
                            time: 6000
                        });
                    }
                }

                if (resp.status === 400 && 'errors' in error) {
                    if ('funcionarioId' in error.errors) {
                        let msg = '';
                        error.errors.funcionarioId.forEach(element => {
                            msg = element;
                        });
                        this._alcanosSnackBar.snackbar({
                            clase: 'error',
                            mensaje: msg,
                            time: 6000
                        });
                    }
                }

                if (resp.status === 400 && 'errors' in error) {
                    if ('snackError' in error.errors) {
                        let msg = '';
                        error.errors.snackError.forEach(element => {
                            msg = element;
                        });
                        this._alcanosSnackBar.snackbar({
                            clase: 'error',
                            mensaje: msg,
                            time: 6000
                        });
                    }
                }
            });
    }
}

export class FilesDataSource extends DataSource<any>{

    constructor(
        private _service: ActividadesListarFuncionarioService
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