import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar } from '@angular/material';
import { merge, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';




@Component({
    selector: 'mostrar-compania',
    templateUrl: './mostrar.component.html',
    styleUrls: ['./mostrar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {


    item: any;
    newVacio: any;

    // Permisos
    arrayPermisos: any;

    constructor(
        private _router: Router,
        private _fuseSidebarService: FuseSidebarService,
        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _service: MostrarService,
        private _permisos: PermisosrService
    ) {
        this.arrayPermisos = this._permisos.permisosStorage('InformacionBasicas_');
    }

    ngOnInit(): void {

        this.newVacio = this._service.vacio;
        this._service.onItemChanged.subscribe(
            (resp) => {
                this.item = resp;
            }
        );
    }
}



