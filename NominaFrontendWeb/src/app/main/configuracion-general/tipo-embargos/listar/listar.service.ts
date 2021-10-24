import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { ClaseConceptoAlcanos } from '@alcanos/constantes/clase-concepto-nomina';
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
                        case 'conceptoNominaId':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`${decodeURIComponent(`conceptoNominaId`)} eq ${decodeURIComponent(value)}`);
                            break;
                        case 'nombre':
                            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                            urlFilters.push(`contains(cast(${decodeURIComponent(`tipoEmbargo/nombre`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                            break;
                    }
                }
            });

            this.dataFilters = dataFilters;
            // Filtro interno @code
            this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
            this.urlFilters['$filter'] = this.urlFilters['$filter'] === true ? `conceptoNomina/claseConceptoNomina eq '${ClaseConceptoAlcanos.deduccion}'` : `${this.urlFilters['$filter']} and conceptoNomina/claseConceptoNomina eq '${ClaseConceptoAlcanos.deduccion}'`;
        } else {
            this.urlFilters['$filter'] = `conceptoNomina/claseConceptoNomina eq '${ClaseConceptoAlcanos.deduccion}'`;
        }

        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'tipoEmbargo/nombre asc';
        }

        // ordenar asc y desc en segundo nivel //
        if (this.urlFilters.hasOwnProperty('$orderBy')) {
            if (this.urlFilters.$orderBy === 'clase desc') {
                this.urlFilters.$orderBy = 'conceptoNomina/nombre desc';
            }
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getTipoEmbargos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getTipoEmbargos(): void {
        this._getTipoEmbargos(this.urlFilters);
    }
    /**
     *
     * @returns {Promise<any>}
     */
    private _getTipoEmbargos(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const unicParams = encodeURI(`$select=id,tipoEmbargoId,conceptoNominaId,estadoRegistro&$expand=tipoEmbargo,conceptoNomina($select=nombre,codigo,id)`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas?${unicParams}&$count=true&${toUrlEncoded(params)}`;
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
    getTipoEmbargoConceptoNominas(id: number): Promise<any> {
        const params = encodeURI(`$select=id,tipoEmbargoId,conceptoNominaId,estadoRegistro&$expand=conceptoNomina($select=nombre,codigo,id)&$filter=estadoRegistro eq 'Activo' and tipoEmbargoId eq ${id}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoEmbargoConceptoNominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    getConceptoRelacionadosLista(): Promise<any> {
        const params = encodeURI(`$filter=claseConceptoNomina eq 'Deduccion' and estadoRegistro eq 'Activo'&$orderBy=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
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
            this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/TipoEmbargos/${id}`, {
                id: id,
                activo: activo
            })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
