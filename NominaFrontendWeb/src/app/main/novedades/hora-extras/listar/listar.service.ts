import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { element } from 'protractor';

@Injectable({
    providedIn: 'root'
})
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

                if (decodeURIComponent(value) !== 'null') {

                    switch (decodeURIComponent(key)) {
                        case 'criterioBusqueda':
                            if (value !== 'null') {
                                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                                urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            }
                            break;
                        case 'terminoIndefinido':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`terminoIndefinido`)} eq ${decodeURIComponent(value)}`);
                            break;
                        case 'clase':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`clase`)} eq '${decodeURIComponent(value)}'`);
                            break;
                        case 'estado':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
                            break;
                        case 'formaRegistro':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`formaRegistro`)} eq '${decodeURIComponent(value)}'`);
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

        // ordenar asc y desc en segundo nivel //
        if (this.urlFilters.hasOwnProperty('$orderBy')) {
            if (this.urlFilters.$orderBy === 'tipoHoraExtra asc') {
                this.urlFilters.$orderBy = 'tipoHoraExtra/tipo asc';
            }
            if (this.urlFilters.$orderBy === 'tipoHoraExtra desc') {
                this.urlFilters.$orderBy = 'tipoHoraExtra/tipo desc';
            }

        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getHoraExtras(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getHoraExtras(): void {
        this._getHoraExtras(this.urlFilters);
    }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getHoraExtras(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const select = encodeURI('$select=id,valor,cantidad,estado,fecha,formaRegistro,funcionario,tipoHoraExtra,estadoRegistro,tipoHoraExtraId');
        // tslint:disable-next-line: max-line-length
        const uriParam = encodeURI('$expand=funcionario($select=id,criterioBusqueda,numeroDocumento,primerNombre,segundoNombre,primerApellido,segundoApellido),tipoHoraExtra($expand=conceptoNomina)');
        const url = `${environmentAlcanos.configuracionGeneral}/odata/horaextras?$count=true&${uriParam}&${select}&${toUrlEncoded(params)}`;
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
     * @param id 
     * @param activo 
     * @returns {Promise<any>}
     */
    activo(id: number, activo: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/Horaextras/${id}`, {
                id: id,
                activo: activo
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    importar(): Promise<any> {
        return new Promise((resolve, reject) => {
            const httpOptions = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
            this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/Horaextras/ImportarHoraExtras`,  {
                "FechaInicial" : null,
                "FechaFinal": null
            }, httpOptions)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
