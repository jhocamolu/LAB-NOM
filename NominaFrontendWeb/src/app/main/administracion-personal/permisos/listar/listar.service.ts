import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { codigoPermisosAlcanos } from '@alcanos/constantes/estado-permisos';

@Injectable({
    providedIn: 'root'
})
export class ListarService implements Resolve<any> {


    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;
    filtroValidado: boolean;
    eleccion: any;
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
        let activeFilter: any = false;
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

                    activeFilter = true;
                    switch (decodeURIComponent(key)) {
                        case 'criterioBusqueda':
                            if (value !== 'null') {
                                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                                urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            }
                            break;
                        case 'tipoAusentismoClase':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`tipoAusentismo/claseAusentismoId`)} eq ${decodeURIComponent(value)}`);
                            break;
                        case 'tipoAusentismoTipo':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`tipoAusentismoId`)} eq ${decodeURIComponent(value)}`);
                            break;
                        case 'estado':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
                            break;
                    }
                }
            });
            this.dataFilters = dataFilters;
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
        }

        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'funcionario/primerNombre asc';
        }

        if (activeFilter) {
            this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
        } else {
            this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getSolicitudPermisos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getSolicitudPermisos(): void {
        this._getSolicitudPermisos(this.urlFilters);
    }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getSolicitudPermisos(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const uriParam = encodeURI('$expand=funcionario,tipoausentismo($expand=claseAusentismo)');
        const url = `${environmentAlcanos.novedades}/odata/SolicitudPermisos?$count=true&${uriParam}&${toUrlEncoded(params)}`;
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
     * 
     * @returns {Promise<any>}
     */
    public getClaseDevengo(): Promise<any> {
        const url = `${environmentAlcanos.novedades}/odata/ClaseAusentismos?$filter=codigo ne '${codigoPermisosAlcanos.incapacidad}'`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getTipoAusentismos(id: number): Promise<any> {
        const param = encodeURI(`$filter=claseAusentismoId eq ${id}`);
        const url = `${environmentAlcanos.novedades}/odata/TipoAusentismos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getTipoAusentismosAll(): Promise<any> {
        const param = encodeURI(`$orderBy=nombre asc`);
        const url = `${environmentAlcanos.novedades}/odata/TipoAusentismos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

}
