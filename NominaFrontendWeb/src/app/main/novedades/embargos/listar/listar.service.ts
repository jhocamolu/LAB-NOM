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

    onTipoDocumentosChange: BehaviorSubject<any[]>;
    onTipoEmbargosChange: BehaviorSubject<any[]>;

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

        this.onTipoDocumentosChange = new BehaviorSubject([]);
        this.onTipoEmbargosChange = new BehaviorSubject([]);
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
                activeFilter = true;

                if (decodeURIComponent(value) !== 'null') {
                    switch (decodeURIComponent(key)) {
                        case 'criterioBusqueda':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            break;
                        case 'tipoEmbargo':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`tipoEmbargoId`)} eq ${decodeURIComponent(value)}`);
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
            this.urlFilters.$orderBy = 'funcionario/primerNombre asc';
        }

        if (activeFilter) {
            this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
        } else {
            this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
        }


        return new Promise((resolve, reject) => {
            Promise.all([
                this._getEmbargos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }


    public getEmbargos(): void {
        this._getEmbargos(this.urlFilters);
    }
    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getEmbargos(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const url = `${environmentAlcanos.configuracionGeneral}/odata/embargos?$expand=funcionario,juzgado,tipoembargo,entidadfinanciera,EmbargosUbperiodos($expand=subPeriodo($expand=tipoPeriodo))&$count=true&${toUrlEncoded(params)}`;
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

    public getTipoDocumentosList(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/tipoDocumentos`)
                .subscribe((response: any) => {
                    this.onTipoDocumentosChange.next(response.value);
                    resolve();
                }, reject);
        });
    }

    public getTipoEmbargosList(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/tipoEmbargos`)
                .subscribe((response: any) => {
                    this.onTipoEmbargosChange.next(response.value);
                    resolve();
                }, reject);
        });
    }

    public getShowTipoPeriodosId(id: number): Promise<any> {
        const param = encodeURI(`$filter=embargoId eq ${id}&$count=true&$expand=subperiodo($expand=tipoperiodo)&orderBy=id desc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/embargosubperiodos?${param}`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    public getEmbargoConceptoNominasId(id: number): Promise<any> {
        const param = encodeURI(`$filter=embargoId eq ${id}&$count=true&$expand=conceptonomina($select=nombre,id)`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/embargoconceptonominas?${param}`)
                .subscribe((response: any) => {
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
            this._httpClient.patch(`${environmentAlcanos.novedades}/api/embargos/${id}`, {
                id: id,
                activo: activo
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
