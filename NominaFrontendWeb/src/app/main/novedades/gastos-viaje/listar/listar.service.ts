import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class ListarService implements Resolve<any> {

    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;
    filtroValidado: boolean;

    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;

    onTipoGastosViajeChange: BehaviorSubject<any[]>;

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

        this.onTipoGastosViajeChange = new BehaviorSubject([]);
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

                if (decodeURIComponent(value) !== 'null') {
                    switch (decodeURIComponent(key)) {
                        case 'criterioBusqueda':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            break;
                        case 'tipoGastoViajes':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`tipoGastoViajeId`)} eq ${decodeURIComponent(value)}`);
                            break;
                        case 'fecha':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`fecha ge ${decodeURIComponent(value)}`);
                            break;
                        case 'estado':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
                            break;
                        default:
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            break;
                    }
                }
            });
            this.dataFilters = dataFilters;
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
        }


        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'fecha desc';
        }


        return new Promise((resolve, reject) => {
            Promise.all([
                this._getGastosViaje(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }


    public getGastosViaje(): void {
        this._getGastosViaje(this.urlFilters);
    }
    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getGastosViaje(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const url = `${environmentAlcanos.configuracionGeneral}/odata/GastoViajes?$expand=funcionario($select=primerNombre,segundoNombre,primerApellido,segundoApellido,numeroDocumento,estadoRegistro),tipoGastoViaje($select=tipo,estadoRegistro)&$count=true&${toUrlEncoded(params)}`;
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

    /**
     * @returns {Promise<any>}
     */

    public getTipoGastosViaje(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoGastoViajes?$orderBy=tipo asc`)
                .subscribe((response: any) => {
                    this.onTipoGastosViajeChange.next(response.value);
                    resolve();
                }, reject);
        });
    }


    /**
     * @param id 
     * @param activo 
     * @returns {Promise<any>}
     */
    activo(id: number, activo: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.novedades}/api/GastoViajes/${id}`, {
                id: id,
                activo: activo
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
