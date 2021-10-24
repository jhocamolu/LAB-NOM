import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Route, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { DocumentosComponent } from '../documentos/documentos.component';
import * as moment from 'moment';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { estadoPermisosAlcanos } from '@alcanos/constantes/estado-permisos';
import { AprobarComponent } from '../aprobar/aprobar.component';

@Component({
    selector: 'permisos-mostrar',
    templateUrl: './mostrar.component.html',
    styleUrls: ['./mostrar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MostrarComponent implements OnInit {

    id: any;
    item: any;
    element: any;
    soportes: any[];
    count: any;

    enviroments: string = environmentAlcanos.gestorArchivos;
    submit: boolean;
    path: string;
    desabilitar: boolean;
    selectedTab = 0;
    arrayPermisos: any;
    arrayPermisosSoporte: any;

    estadoPermisosAlcanos = estadoPermisosAlcanos;


    constructor(
        private _matDialog: MatDialog,
        private _alcanosSnackBar: AlcanosSnackBarService,
        private _service: MostrarService,
        private _permisos: PermisosrService
    ) {
        this.arrayPermisos = this._permisos.permisosStorage('SolicitudPermisos_')

        this.arrayPermisosSoporte = this._permisos.permisosStorage('SoporteSolicitudPermiso_')
        this._service.onItemsChanged.subscribe((resp) => {
            this.element = resp;
            this.id = resp.id;
        });

        this._service._getSoportePermisosFile().then((resp) => {
            this.soportes = resp.value;
            this.count = resp['@odata.count'];
        });
    }

    ngOnInit(): void { }

    tabChangeHandle(event): void {
        this.selectedTab = event.index;
    }

    // se comunica con el soportes permisos
    soporteHandle(event, element): void {
        const dialogRef = this._matDialog.open(DocumentosComponent, {
            panelClass: 'modal-dialog',
            data: element,
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined' && result != null) {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._service._getSoportePermisosFile().then((resp) => {
                    this.soportes = resp.value;
                });
                this.selectedTab = 1;
            }
        });
    }

    respuestaHanlde(event, element, type): void {
        const dialogRef = this._matDialog.open(AprobarComponent, {
            panelClass: 'modal-dialog',
            disableClose: false,
            data: { 'dato': element, 'tipo': type }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined' && result != null) {
                this._alcanosSnackBar.snackbar({ clase: 'exito' });
                this._service.getPermisos(this._service.id).then((resp) => {
                    this.element = resp;
                    this.id = resp.id;
                });
            }
        });
    }

    public siguienteHandle() {
        this.selectedTab += 1;
    }

    public anteriorHandle() {
        this.selectedTab -= 1;
    }

    selectedTabChangeHandle(event) {
        this.selectedTab = event.index;
    }

}
