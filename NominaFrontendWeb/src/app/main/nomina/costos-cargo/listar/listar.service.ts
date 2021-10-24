import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';


@Injectable({
    providedIn: 'root'
})
export class ListarService implements Resolve<any>{

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

        this.dataFilters = {};
        if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
            this.page = 0;
            this.urlFilters['$top'] = 5;
            this.urlFilters['$skip'] = 0;
        } else {
            this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
        }

        if (this.urlFilters.hasOwnProperty('$filter')) {
            const dataFilters = {};
            const urlFilters = [];
            this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
                switch (decodeURIComponent(key)) {
                    case 'cargo':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`cargo/nombre`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                    case 'centroOperativo':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`centroOperativoId`)} eq ${decodeURIComponent(value)}`);
                        }
                        break;
                    case 'nombreCentroCosto':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`actividadCentroCosto/centroCosto/nombre`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                    case 'codigoCentroCosto':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`actividadCentroCosto/centroCosto/codigo`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                    case 'fechaCorte':
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`fechaCorte`)}, 'Edm.String'),'${moment(new Date(decodeURIComponent(value))).format('YYYY-MM-DD')}')`);
                        }
                        break;
                    default:
                        if (value !== 'null') {
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                        }
                        break;
                }
            });

            this.dataFilters = dataFilters;
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
        }

        
        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'fechaCorte desc';
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getCostosPorCargo(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    public getCostosPorCargo(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const expand = `$select=id,cargoId,porcentaje,fechaCorte,centroOperativoId,actividadCentroCostoId&$expand=cargo($select=id,codigo,nombre),centroOperativo($select=id,nombre),ActividadCentroCosto($select=id,centroCostoId;$expand=centroCosto($select=id,nombre,codigo))`;
        const url = `${environmentAlcanos.configuracionGeneral}/odata/CargoCentroCostos?$count=true&${expand}&${toUrlEncoded(params)}`;

        this.dataRequest.next(true);
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.totalCount = response['@odata.count'];
                    this.items = response.value;
                    this.onItemsChanged.next(this.items);
                    this.dataRequest.next(false);
                    resolve(response);
                }, reject);
        });
    }


    public getCentroOperativos(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/CentroOperativos`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }
}
