import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material';
import { DatosComponent } from '../datos/datos.component';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
    selector: 'card-data',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class CardComponent implements OnInit {

    // tslint:disable-next-line: no-input-rename
    @Input('wid') wid: any;

    // tslint:disable-next-line: no-input-rename
    @Input('color') color: any;

    // se inyecta la data procedente a todos los widgets de manera individual por input 
    // tslint:disable-next-line: no-input-rename
    @Input('widget') widget: any;

    widgets: any;
    contenido: any;
    hoover: boolean = false;

    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private _matDialog: MatDialog,
    ) { }
    get dataWidget(): any {
        return this.widget;
    }

    ngOnInit(): void {
        // se inyectan como modelo de datos al card component
        this.widgets = this.dataWidget;
    }

    modalHandle(event, widgets): void {

        if (!(widgets.count === "0" || widgets.dataModal === [] || widgets.dataModal == null)) {
            if (widgets.count.length < 6) {
                const dialogRef = this._matDialog.open(DatosComponent, {
                    panelClass: 'modal-dialog700',
                    disableClose: false,
                    data: widgets
                });
                dialogRef.afterClosed().subscribe(result => { });
            }
        }
    }

    hooverHanlde(widgets): void {
        if (!(widgets.count === "0" || widgets.dataModal === [] || widgets.dataModal == null)) {
            if (widgets.count.length < 6) {
                this.hoover = true;
            } else {
                this.hoover = false;
            }
        }
    }
}


/* Comentarios de desarrollador - aqui se encuentra el modelo de datos */
/*const resp = {
            widget1: {
                label: 'Colaboradores',
                count: 1492,
                extra: {
                    count: 1500000000
                }
            }
        };*/


