import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class MostrarService implements Resolve<any> {

    id: number;


    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;
    routeQueryParams: any;
    items: any[];
    path: string;
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;


    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
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
        this.id = route.params.id;
        this.path = route.url[1].path;
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTipoBeneficio(this.id),
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
     * @param id // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getTipoBeneficio(id: number): Promise<any> {
        const params = encodeURI('$expand=conceptoNominaDevengo,conceptoNominaDeduccion,conceptoNominaCalculo');
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipobeneficios/${id}?${params}`)
                .subscribe((response: any) => {
                    this.items = response;
                    this.onItemsChanged.next(this.items);
                    resolve(response);
                }, reject);
        });
    }

    /**
     * 
     * @param id // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getRequisito(id: number): Promise<any> {
        const params = encodeURI(`$expand=tipoSoporte&$filter=tipoBeneficioId eq ${id}&$count=true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipobeneficiorequisitos?${params}`)
                .subscribe((response: any) => {
                    this.totalCount = response['@odata.count'];
                    this.items = response.value;
                    resolve(response.value);
                }, reject);
        });
    }


}
