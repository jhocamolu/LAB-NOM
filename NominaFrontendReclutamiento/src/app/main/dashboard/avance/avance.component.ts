import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { DashboardService } from '../dashboard.service';
import { AvanceService } from './avances.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';


@Component({
    selector: 'avance-list',
    templateUrl: './avance.component.html',
    styleUrls: ['./avance.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AvanceComponent implements OnInit, OnDestroy {
    items: any[] = [];
    avance: any;
    user: any;
    menu: string;
    loading: boolean = true;
    private _unsubscribeAll: Subject<any>;
    colors: string[] = [
        '#03a9f4',
        '#f44336',
        '#ff9800',
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

    constructor(
        private _dashboardService: DashboardService,
        public _matDialog: MatDialog,
        private _service: AvanceService,
        private _cookieService: CookieService,
        private _router: Router
    ) {
        if (this._cookieService.check('User')) {
            let token = JSON.parse(this._cookieService.get('User')).token
            this.user = JSON.parse(atob(token.split('.')[1]))
        } else {
            this._router.navigate(['/logout'])
            return
        }

        this._service.getAvances(this.user.jti).then(data => {
            this.avance = data;
            this.items.push({
                numero: this.avance.convocatoriasAbiertas,
                nombre: "Convocatorias abiertas"
            });

            this.items.push({
                numero: this.avance.aplicaciones,
                nombre: "Aplicaciones"
            });

            this.items.push({
                numero: `${this.avance.avanceHojaDeVida} %`,
                nombre: "De avance en tu hoja de vida"
            });
            if(this.avance.avanceHojaDeVida < 60){
                this._dashboardService.onBlockChanged.next(true);
                this._dashboardService.onFilterChanged.next('hoja_vida');
            }else{
                this._dashboardService.onBlockChanged.next(false);
                this._dashboardService.onFilterChanged.next('inicio');
            }
            
        })
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._service.dataRequest.subscribe(
            (resp: boolean) => {
                this.loading = resp;
            }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
    }


    color(i: number): string {
        return this.colors[i % this.colors.length];
    }
}
