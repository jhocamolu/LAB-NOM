import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ElementRef, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ActividadesListarCargoService } from './listar.service';
import { merge, Observable, of as observableOf, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormularioActividadCargoComponent } from '../formulario-cargo/formulario.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
    selector: 'actividades-listar-cargo',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ActividadesListarCargoComponent implements OnInit, OnDestroy {

    datos: any;
    count: number;
    datosUrl: any;
    espera: boolean;
    nombreCargo: any;
    arrayPermisos: any; 


    constructor(
        private _service: ActividadesListarCargoService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _permisos: PermisosrService,
        private _alcanosSnackBar: AlcanosSnackBarService,
    ) {
        this.count = 0;
        this._service.dataFilters;
        this.espera = false;

        this.nombreCargo = {
            nombre: null, 
            codigo: null
        }
        this._service.getCargoCentroCostos().then(response => {
            this.datosUrl = response;
        });

        this.arrayPermisos = this._permisos.permisosStorage('CargoCentroCostos_', null, 'CargoCentroCostos_CrearManual');
        setTimeout(() => {
            this._service.getCargos(this.datosUrl.cargoId).then(resp => {
                this.nombreCargo = resp;
            });
        }, 300);

    }

    ngOnInit(): void {



        if (JSON.parse(localStorage.getItem('carga')) != null || JSON.parse(localStorage.getItem('carga'))) {
            this.count = JSON.parse(localStorage.getItem('carga')).length;
            this.datos = JSON.parse(localStorage.getItem('carga'));
        }
    }

    validarItem(elegir): boolean {
        if (elegir) {
            return true;
        }
        if (JSON.parse(localStorage.getItem('carga')) != null) {
            if (JSON.parse(localStorage.getItem('carga')) != null || JSON.parse(localStorage.getItem('carga'))) {
                let percent = 0;
                JSON.parse(localStorage.getItem('carga')).forEach(element => {
                    percent += Number(element.porcentaje);
                });

                if (Number(percent) > 100) {
                    this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: 'El porcentaje que ingresaste excede el 100% de la distribución de costos, por favor revise',
                        time: 7000
                    });
                }
                return Number(percent) >= 100 ? true : false;
            }
        }
        return false;
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
                localStorage.removeItem('db');
                localStorage.removeItem('carga');
                localStorage.removeItem('editado');
                this._router.navigate(['/nomina/proceso-costos/']);
            }
        });
    }


    visible(): boolean {
        if (this.count == 0) {
            return false;
        } else {
            return true;
        }
    }

    crearHandle(event): void {
        const dialogRef = this._matDialog.open(FormularioActividadCargoComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
            data: { id: null, url: this.datosUrl }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (JSON.parse(localStorage.getItem('carga')) != null || JSON.parse(localStorage.getItem('carga'))) {
                this.count = JSON.parse(localStorage.getItem('carga')).length;
                this.datos = JSON.parse(localStorage.getItem('carga'));
            }
        });
    }

    editarHandle(event, dato): void {
        const dialogRef = this._matDialog.open(FormularioActividadCargoComponent, {
            panelClass: 'modal-dialog',
            disableClose: true,
            data: { id: dato.id, informacion: dato, url: this.datosUrl }
        });
        dialogRef.afterClosed().subscribe(result => {

            if (JSON.parse(localStorage.getItem('carga')) != null || JSON.parse(localStorage.getItem('carga'))) {
                this.count = JSON.parse(localStorage.getItem('carga')).length;
                this.datos = JSON.parse(localStorage.getItem('carga'));
            }
        });
    }

    crearFinalizacion(): void {
        if (JSON.parse(localStorage.getItem('carga')) == null || !JSON.parse(localStorage.getItem('carga'))) {
            this._alcanosSnackBar.snackbar({
                clase: 'error',
                mensaje: 'No es posible guardar información si no se cuenta con datos pregrabados por favor revise',
                time: 7000
            });
        } else {
            let validacion = 0;
            if (localStorage.getItem('carga').length > 0) {
                JSON.parse(localStorage.getItem('carga')).forEach(element => {
                    validacion += Number(element.porcentaje);
                });
                if (validacion < 101) {

                    this._alcanosSnackBar.snackbar({
                        clase: 'error',
                        mensaje: 'No se ha completado el 100% de la distribución de costos, por favor revise',
                        time: 7000
                    });
                } else {
                    let a = [];
                }
            }
        }
    }

    // Construye el objeto completo a enviar
    enviarCompleto(): void {

        this.espera = true;
        let aBody = [];
        let final = [];

        if (JSON.parse(localStorage.getItem('carga')) != null) {
            let validacionCompleto = 0;
            JSON.parse(localStorage.getItem('carga')).forEach(element => {
                validacionCompleto += Number(element.porcentaje);
            });
            if (validacionCompleto == 100) {
                JSON.parse(localStorage.getItem('carga')).forEach(element => {
                    aBody.push({
                        actividadCentroCostoId: element.actividadCentroCostoId,
                        Porcentaje: element.porcentaje > 1 ? Number(element.porcentaje) : element.porcentaje
                    });
                });

                JSON.parse(localStorage.getItem('carga')).map(resp => {
                    final.push({
                        tipoDistribucion: 'Cargo',
                        funcionarioId: null,
                        cargoId: Number(resp.cargoId),
                        centroOperativoId: Number(resp.centroOperativoId),
                        fechaCorte: resp.fechaCorte,
                        listaCargoCentroCosto: aBody
                    });
                });

                this.guardarenPost(final[0]);
            }
            else {
                this._alcanosSnackBar.snackbar({ clase: 'error', mensaje: 'No es posible incluir datos inferiores/superiores a un 100% por favor revise' });
            }
        }

    }

    // Toma el objeto creado y o envia por http
    guardarenPost(formValue) {
        this._service.crear(formValue)
            .then((resp) => {
                this.validarItem(true);
                this.espera = false;
                localStorage.removeItem('bd');
                localStorage.removeItem('editado');
                localStorage.removeItem('carga');
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._router.navigate(['/nomina/costos-cargo/']);
            }   
            ).catch((resp: HttpErrorResponse) => {
                this.validarItem(true);
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


    ngOnDestroy(): void {
        localStorage.removeItem('carga');
    }

}
