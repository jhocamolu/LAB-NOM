import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import * as shape from 'd3-shape';

import { fuseAnimations } from '@fuse/animations';

import { PrincipalService } from './principal.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'principal-dashboard',
    templateUrl: './principal.component.html',
    styleUrls: ['./principal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PrincipalComponent implements OnInit {
    user: any;
    nombre: string;
    items: any = [];
    mesDiaAnio: any;
    proximosCumpleanos;
    chartRedondo: any;
    funcionarios: any;
    dataChart: any[] = [];
    colorChart: any;
    dataFuncionario: any[] = []
    colorFuncionario: any;
    yAxisLabel = 'Funcionarios';
    xAxisLabel = 'Centro operativos';
    data: boolean = false;
    projects: any[];
    selectedProject: any;

    widgets: any;
    widget5: any = {};
    widget6: any = {};
    widget7: any = {};
    widget8: any = {};
    widget9: any = {};
    widget11: any = {};

    dateNow = Date.now();

    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {ProjectDashboardService} _projectDashboardService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private _principalService: PrincipalService,
        private _cookieService: CookieService
    ) {
        if (this._cookieService.check('User')) {
            this.user = JSON.parse(this._cookieService.get('User'))
            this.nombre = this.user.nombre.split(' ')[0].charAt(0).toUpperCase() + this.user.nombre.split(' ')[0].toLowerCase().split(' ')[0].slice(1)
            if(this._principalService.onItemsChanged.value){
                let mesdia = []
                let newChartRedondo = []
                let newDataFuncionario = []
                let pies = []
                Object.keys(this._principalService.onItemsChanged.value).forEach(function(key) {
                    if(key.startsWith('lateral')){
                        mesdia.push(key)
                    }
                });
                this.data = true;
                if(mesdia){
                    this.mesDiaAnio = JSON.parse(JSON.stringify((eval("(" + this._principalService.onItemsChanged.value[mesdia[0]].datos + ")"))))
                    this.proximosCumpleanos = this._principalService.onItemsChanged.value[mesdia[1]]
                }
                // this.chartRedondo = this._principalService.onItemsChanged.value['pie-21']
                // this.funcionarios = this._principalService.onItemsChanged.value['pie-20']
                Object.keys(this._principalService.onItemsChanged.value).forEach(function(key) {
                    if(key.startsWith('pie')){
                        pies.push(key)
                    }
                });
                
                if(pies){
                    this._principalService.onItemsChanged.value[pies[1]].labels.forEach(element => {
                        newChartRedondo.push({
                            name: element,
                            value: null
                        })
    
                        const index = this._principalService.onItemsChanged.value[pies[1]].labels.findIndex(data => data === element)
                        newChartRedondo[index].value = this._principalService.onItemsChanged.value[pies[1]].data.data[index]
                    });
                    this.dataChart = newChartRedondo
                    this.colorChart = {
                        scheme: {
                            domain: this._principalService.onItemsChanged.value[pies[1]].data.backgroundColor
                        }
                    }
                    
                    this._principalService.onItemsChanged.value[pies[0]].labels.forEach(element => {
                        newDataFuncionario.push({
                            name: element,
                            value: null
                        })
    
                        const index = this._principalService.onItemsChanged.value[pies[0]].labels.findIndex(data => data === element)
                        newDataFuncionario[index].value = this._principalService.onItemsChanged.value[pies[0]].data.data[index]
                    });
                    this.dataFuncionario = newDataFuncionario
                    this.colorFuncionario = {
                        scheme: {
                            domain: this._principalService.onItemsChanged.value[pies[0]].data.backgroundColor
                        }
                    }
                    this.chartRedondo = this._principalService.onItemsChanged.value[pies[1]];
                    this.funcionarios = this._principalService.onItemsChanged.value[pies[0]];
                }
                for (const item in this._principalService.onItemsChanged.value) {
                    this.items.push({ name: item, value: this._principalService.onItemsChanged.value[item] })
                }
            }
        }

        /**
         * Widget 5
         */
        this.widget5 = {
            currentRange: 'TW',
            xAxis: true,
            yAxis: true,
            gradient: false,
            legend: false,
            showXAxisLabel: false,
            xAxisLabel: 'Days',
            showYAxisLabel: false,
            yAxisLabel: 'Isues',
            scheme: {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            onSelect: (ev) => {
                console.log(ev);
            },
            supporting: {
                currentRange: '',
                xAxis: false,
                yAxis: false,
                gradient: false,
                legend: false,
                showXAxisLabel: false,
                xAxisLabel: 'Days',
                showYAxisLabel: false,
                yAxisLabel: 'Isues',
                scheme: {
                    domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
                },
                curve: shape.curveBasis
            }
        };

        /**
         * Widget 6
         */
        this.widget6 = {
            currentRange: 'TW',
            legend: false,
            explodeSlices: false,
            labels: true,
            doughnut: true,
            gradient: false,
            scheme: {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
            },
            onSelect: (ev) => {
                console.log(ev);
            }
        };

        // console.log(this.widget6.scheme)

        /**
         * Widget 7
         */
        this.widget7 = {
            currentRange: 'T'
        };

        /**
         * Widget 8
         */
        this.widget8 = {
            legend: false,
            explodeSlices: false,
            labels: true,
            doughnut: false,
            gradient: false,
            scheme: {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#ffc107']
            },
            onSelect: (ev) => {
                console.log(ev);
            }
        };

        /**
         * Widget 9
         */
        this.widget9 = {
            currentRange: 'TW',
            xAxis: false,
            yAxis: false,
            gradient: false,
            legend: false,
            showXAxisLabel: false,
            xAxisLabel: 'Days',
            showYAxisLabel: false,
            yAxisLabel: 'Isues',
            scheme: {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            curve: shape.curveBasis
        };

        setInterval(() => {
            this.dateNow = Date.now();
        }, 1000);

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // this.projects = this._principalService.projects;
        // this.selectedProject = this.projects[0];
        // this.widgets = this._principalService.widgets;

        /**
         * Widget 11
         */
        // this.widget11.onContactsChanged = new BehaviorSubject({});
        // this.widget11.onContactsChanged.next(this.widgets.widget11.table.rows);
        // this.widget11.dataSource = new FilesDataSource(this.widget11);
    }

    getNameCapitalize(value){
        return `${value.nombre.toLowerCase().split(' ')[0].charAt(0).toUpperCase() + value.nombre.toLowerCase().split(' ')[0].slice(1)} 
                 ${value.nombre.toLowerCase().split(' ')[1].charAt(0).toUpperCase() + value.nombre.toLowerCase().split(' ')[1].slice(1)}`
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}

export class FilesDataSource extends DataSource<any>
{
    /**
     * Constructor
     *
     * @param _widget11
     */
    constructor(private _widget11) {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        return this._widget11.onContactsChanged;
    }

    /**
     * Disconnect
     */
    disconnect(): void {
    }
}

