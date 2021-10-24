import { Inject, Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FiltroComponent } from '../filtro/filtro.component';
import { MatSnackBar } from '@angular/material';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
    selector: 'funcionarios-listar',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    todosFuncionarios: any[] = [];
    enviroments: string = environmentAlcanos.gestorArchivos;

    colors: string[] = [
        '#B72974',
        '#FFA124',
        '#066F77',
        '#6232CC',
        '#004693',
        '#EE564C',
        '#602411',
        '#EF6100',
        '#FF7D43',
        '#8822A0',
        '#3DBDD3',
        '#CE7459',
        '#9B193E',
        '#3FD195',
        '#FF7D7D',
        '#9ABF00',
    ];

    dataRequest: boolean;
    arrayPermisos:any;
    constructor(
        private _service: ListarService,
        private _fuseSidebarService: FuseSidebarService,
        private _matSnackBar: MatSnackBar,
        private _router: Router,
        private _matDialog: MatDialog,
        private _permisos : PermisosrService
    ) {
        this.arrayPermisos = this._permisos.permisosStorage('Funcionarios_')
        this.dataRequest = false;
    }

    ngOnInit(): void {
        this._service.dataRequest.subscribe(
            (resp: boolean) => {
                this.dataRequest = resp;
            }
        );
        this._service.onItemsChanged.subscribe((resp) => {
            this.todosFuncionarios = resp;
        });
    }

    color(i: number): string {
        return this.colors[i % this.colors.length];
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnDestroy(): void {

    }

    crearHandle(event): void {
        this._router.navigate(
          ['/administracion-personal/funcionarios/datos-basicos'],
        );
      }

    doSomethingOnScroll(event): void {
        if (this.dataLength > 48) {
            this._router.navigate(
                ['/administracion-personal/funcionarios'],
                {
                    queryParams: {
                        $top: (this._service.top + 12)
                    },
                    queryParamsHandling: 'merge',
                });
        }

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
            ['/administracion-personal/funcionarios'],
            {
                queryParams: {
                    $filter: true,
                },
            });
        return;
    }

}

