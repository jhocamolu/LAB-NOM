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

        if (!this.urlFilters.hasOwnProperty('$orderBy')) {
            this.urlFilters.$orderBy = 'fechaCreacion desc';
        }


        return new Promise((resolve, reject) => {
            Promise.all([
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
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

    public eliminarAplicacion(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
          this._httpClient.delete(`${environmentAlcanos.portal}/reclutamiento/Candidatos/${dato.id}`)
            .subscribe((response: any) => {
              resolve(response);
            }, reject);
        });
      }
}
