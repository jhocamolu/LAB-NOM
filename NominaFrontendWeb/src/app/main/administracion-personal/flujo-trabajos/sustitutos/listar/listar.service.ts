import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class ListarService implements Resolve<any> {

    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;

    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the defaults
        this.totalCount = 0;
        this.dataFilters = {};
        this.onItemsChanged = new BehaviorSubject({});
        this.dataRequest = new BehaviorSubject(false);
        moment.defaultFormatUtc;
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        
        this.urlFilters = JSON.parse(JSON.stringify(route.queryParams));
        let activeFilter: any = false;
        if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
            this.page = 0;
            this.urlFilters['$top'] = 5;
            this.urlFilters['$skip'] = 0;
            this.dataFilters = {};
        } else {
            this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
        }
        if (this.urlFilters.hasOwnProperty('$filter')) {
            const dataFilters = {};
            const urlFilters = [];
            this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
                activeFilter = true;
                switch (decodeURIComponent(key)) {
                    case 'cargoASustituir':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`cargoASustituir/nombre`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                    case 'cargoSustituto':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`cargoSustituto/nombre`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                    case 'fechaInicio':
                        if (decodeURIComponent(value) != 'null') {
                            const dateIn = new Date(decodeURIComponent(value));
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`fechaInicio ge ${String(dateIn.getFullYear() + '-' + (dateIn.getMonth() + 1) + '-' + dateIn.getDate())}`);
                        }
                        break;
                    case 'fechaFinal':
                        if (decodeURIComponent(value) != 'null') {
                            const dateFin = new Date(decodeURIComponent(value));
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`fechaFinal le ${String(dateFin.getFullYear() + '-' + (dateFin.getMonth() + 1) + '-' + dateFin.getDate())}`);
                        }
                        break;
                    default:
                        dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                        urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                        break;
                }

            });
            this.dataFilters = dataFilters;
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
        }

        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'FechaInicio desc';
        }

        if (activeFilter) {
            this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
        } else {
            this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getSustitutos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }
    

    public getSustitutos(): void {
        this._getSustitutos(this.urlFilters);
    }

    /**
     * @returns {Promise<any>}
     */
    private _getSustitutos(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const url = `${environmentAlcanos.administracionPersonal}/odata/sustitutos?$expand=cargoASustituir,cargoSustituto,centroOperativoASutituir,centroOperativoSustituto&$count=true&${toUrlEncoded(params)}`;
        this.dataRequest.next(true);
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.totalCount = response['@odata.count'];
                    this.items = response.value;
                    this.onItemsChanged.next(this.items);
                    this.dataRequest.next(false);
                    resolve();
                }, reject);
        });
    }

    /**
         * 
         * @returns {Promise<any>}
         */
    public getCargos(): Promise<any> {
        const params = encodeURI(`$orderby=nombre`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve();
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getCentroCostos(): Promise<any> {
        const params = encodeURI(`$orderby=nombre`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/centrocostos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve();
            }, reject);
        });
    }

}
