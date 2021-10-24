import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ListarService } from './listar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FiltroComponent } from '../filtro/filtro.component';
import { MatSnackBar } from '@angular/material';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { reportesArchivos } from '@alcanos/constantes/reportes-archivos';

// Importar componentes
import { UnoCrearComponent } from '../../pruebas/uno-crear-modal/crear.component';
import { RegistraduriaComponent } from '../../administracion-personal/registraduria/crear.component';
import { ConsolidadoComponent } from '../../nomina/consolidado/consolidado.component';
import { ArchivoTipo1PilaComponent } from '../../nomina/archivo-pila-uno/crear.component';
import { MediosMagneticosComponent } from '../../nomina/medios-magneticos/crear.component';

@Component({
    selector: 'reportes-listar',
    templateUrl: './listar.component.html',
    styleUrls: ['./listar.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ListarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    todosReportes: any[] = [];
    enviroments: string = environmentAlcanos.gestorArchivos;
    reportesArchivos: any = reportesArchivos;
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

    bloque: any;
    active: boolean;


    title: any;
    dataRequest: boolean;
    // Permisos
    obtenerPermisos: any;

    constructor(
        private _service: ListarService,
        private _router: Router,
        private _matDialog: MatDialog,
    ) {
        this.dataRequest = false;

    }

    ngOnInit(): void {
        this._service.dataRequest.subscribe(
            (resp: boolean) => {
                this.dataRequest = resp;
            }
        );
        this._service.onItemsChanged.subscribe((resp) => {
            this.todosReportes = resp;
        });
        this._service.onCategoryChanged.subscribe(resp => {
            this.title = resp[0];
        });

    }

    probarPermiso(value): boolean {
        this.obtenerPermisos = JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes(value));
        //console.log( JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes('MediosMagneticos')));
        //return true;
        
        // se elimina libro de vacaciones pues se encuentra en administracion-personal/vacaciones/libro-vacaciones
        if ('LibroVacaciones_GenerarReporte' === value) {
            return false;
        }
        if (this.obtenerPermisos.find(x => x === value)) {
            return true;
        } else {
            return false;
        }
    }

    color(i: number): string {
        return this.colors[i % this.colors.length];
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void { }

    ngOnDestroy(): void { }

    ejecutarHandle(event, data): void {

        let component = null;
        switch (data) {
            case 'ejemplobuenaspracticas':
                component = UnoCrearComponent;
                break;
            case 'registraduria':
                component = RegistraduriaComponent;
                break;
            case 'consolidadoconceptosnomina':
                component = ConsolidadoComponent;
                break;
            case 'archivotipo1pila':
                component = ArchivoTipo1PilaComponent;
                break;
            case 'mediosmagneticos':
                component = MediosMagneticosComponent;
                break;
            default:
                component = null;
                break;
        }

        if (component != null) {
            this.dashboardModalHandle(component, 'service');
        }
    }


    dashboardModalHandle(component, service): void {
        const dialogRef = this._matDialog.open(component, {
            panelClass: 'modal-dialog',
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                //this._service.getCategorias();
            }
        });
    }


    doSomethingOnScroll(event): void {
        if (this.dataLength > 48) {
            this._router.navigate(
                [`/reportes/${this._service.alias}/dashboard`],
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
            [`/reportes/${this._service.alias}/dashboard`],
            {
                queryParams: {
                    $filter: true,
                },
            });
        return;
    }

}

