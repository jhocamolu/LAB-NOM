import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { map } from 'rxjs/operators';

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
        // if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
        //     this.page = 0;
        //     this.urlFilters['$top'] = 5;
        //     this.urlFilters['$skip'] = 0;
        // } else {
        //     this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
        // }

        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'fechaInicio desc';
        }


        return new Promise((resolve, reject) => {
            Promise.all([
                // this._getConvocatorias(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getConvocatorias(): void {
        // this._getConvocatorias(this.urlFilters);
    }
    /**
     * 
     *
     * @returns {Promise<any>}
     */
    // public _getConvocatorias(params: any = {}): Promise<any> {
    //     const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    //     const url = `${environmentAlcanos.portal}/odata/Custom/_RequisicionPersonales?&$count=true&$expand=cargoDependenciaSolicitado($expand=cargo),divisionPoliticaNivel2&${toUrlEncoded(params)}`;
    //     this.dataRequest.next(true);
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get(url)
    //             .subscribe((response: any) => {
    //                 this.totalCount = response['@odata.count'];
    //                 this.items = response.value;
    //                 this.onItemsChanged.next(this.items);
    //                 this.dataRequest.next(false);
    //                 this.page = 0;
    //                 this.urlFilters['$top'] = 5;
    //                 this.urlFilters['$skip'] = 0;
    //                 resolve(response);
    //             }, reject);
    //     });
    // }

    _getConvocatorias(sortOrder = 'fechaCreacion asc',
        pageNumber = 0, pageSize = 5):  Observable<any[]> {

        return this._httpClient.get<any[]>(
            `${environmentAlcanos.portal}/odata/Custom/_RequisicionPersonales?$count=true&$expand=cargoDependenciaSolicitado($expand=cargo),divisionPoliticaNivel2&$filter=estado eq 'Autorizada'`, {
            params: new HttpParams()
                .set('$orderBy', sortOrder)
                .set('$skip', pageNumber.toString())
                .set('$top', pageSize.toString())
        });
    }

    _getAplicaciones(data:any,sortOrder = 'fechaCreacion asc',
        pageNumber = 0, pageSize = 5):  Observable<any[]> {
        return this._httpClient.get<any[]>(
            `${environmentAlcanos.portal}/odata/Custom/_Candidatos?$count=true&$expand=requisicionPersonal($expand=cargoDependenciaSolicitado($expand=cargo),divisionPoliticaNivel2)&$filter= hojaDeVida/numeroDocumento  eq '${data.jti}'`, {
            params: new HttpParams()
                .set('$orderBy', sortOrder)
                .set('$skip', pageNumber.toString())
                .set('$top', pageSize.toString())
        });
    }
}
