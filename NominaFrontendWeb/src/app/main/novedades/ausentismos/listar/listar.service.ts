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

    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;

    //datos para filtros
    onTipoAusentismoChanged: BehaviorSubject<any>;

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

        this.onTipoAusentismoChanged = new BehaviorSubject([]);
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
                if (decodeURIComponent(value) !== 'null') {
                    activeFilter = true;
                    if (key === 'criterioBusqueda') {
                        dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                        urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                    }

                    if (key === 'tipoAusentismoId') {
                        dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                        urlFilters.push(`tipoAusentismoId eq ${decodeURIComponent(value)}`);
                    }
                    if (key === 'estado') {
                        dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                        urlFilters.push(`estado eq '${decodeURIComponent(value)}'`);
                    }

                }
            });
            this.dataFilters = dataFilters;
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
        }
        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'fechaInicio desc';
        }

        if (activeFilter) {
            this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
        } else {
            this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getTipoAusentismos(),
                this._getAusentismoFuncionarios(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }


    public getAusentismosFuncionarios(): void {
        this._getAusentismoFuncionarios(this.urlFilters);
    }
    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getAusentismoFuncionarios(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        // tslint:disable-next-line: max-line-length
        const param = `$expand=ausentismoDe,funcionario,tipoAusentismo($expand=claseAusentismo),diagnosticoCie&$count=true`
        const url = `${environmentAlcanos.novedades}/odata/AusentismoFuncionarios?${param}&${toUrlEncoded(params)}`;
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
     * @param id 
     * @param activo 
     * @returns {Promise<any>}
     */
    activo(id: number, activo: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.novedades}/api/AusentismoFuncionarios/${id}`, {
                id: id,
                activo: activo
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    // /**
    //  * @param id 
    //  * @param activo 
    //  * @returns {Promise<any>}
    //  */
    // estado(id: number, activo: boolean): Promise<any> {

    //   return new Promise((resolve, reject) => {
    //     if (activo) {
    //       estado == 
    //     }
    //     this._httpClient.patch(`${environmentAlcanos.novedades}/api/AusentismoFuncionarios/${id}`, {
    //       id: id,
    //       estado: 'Anulado'
    //     })
    //       .subscribe((response: any) => {
    //         resolve(response);
    //       }, reject);
    //   });
    // }

    /**
     * @param id    
     * @returns {Promise<any>}
     */
    borrar(id: number): Promise<any> {
        const url = `${environmentAlcanos.novedades}/api/AusentismoFuncionarios/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.delete(url)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    private _getTipoAusentismos(): Promise<any> {
        const params = encodeURI(
            `$orderby=nombre&$filter=estadoRegistro eq 'Activo'`
        );
        const url = `${environmentAlcanos.novedades}/odata/tipoAusentismos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onTipoAusentismoChanged.next(response.value);
                resolve();
            }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getProrroga(prorrogaId: number): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const url = `${environmentAlcanos.novedades}/odata/prorrogaausentismos/${prorrogaId}?$expand=prorroga($expand=diagnosticoCie)`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }



}
