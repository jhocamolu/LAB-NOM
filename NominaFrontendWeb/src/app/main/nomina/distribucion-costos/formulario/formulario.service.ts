import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

    tab: number;
    id: number;
    onItemChanged: BehaviorSubject<any>;

    onClaseConceptonominaChanged: BehaviorSubject<any[]>;
    onTipoConceptoNominaChanged: BehaviorSubject<any[]>;
    onFuncionNominasChanged: BehaviorSubject<any>;



    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.onClaseConceptonominaChanged = new BehaviorSubject([]);
        this.onTipoConceptoNominaChanged = new BehaviorSubject([]);
        this.onFuncionNominasChanged = new BehaviorSubject({});
        // Set the defaults
        this.onItemChanged = new BehaviorSubject(null);
        this.tab = 0;
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.id = route.params.id ? route.params.id : null;
        this.tab = route.queryParams.tab != null ? route.queryParams.tab : 0;

        this.onItemChanged.next(null);
        const promises = [];
        if (this.id) {
            promises.push(this._getActividades(this.id));
        }
        return new Promise((resolve, reject) => {
            Promise.all([
                promises
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
     * @param id 
     * @returns {Promise<any>}
     */
    private _getActividades(id: number): Promise<any> {
        // const params = encodeURI('$expand=cuentaContable');
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/actividades/${id}`)
                .subscribe((response: any) => {
                    this.onItemChanged.next(response);
                    resolve();
                }, reject);
        });
    }


    /**
     * 
     * @param dato 
     */
    public upsert(dato: any): Promise<any> {
        if (this.id) {
            return this._editar(this.id, dato);
        }
        return this._crear(dato);
    }

    /**      
     * @param dato 
     * @returns {Promise<any>}
     */
    private _crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.nomina}/api/actividades`,
                dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    private _editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.nomina}/api/actividades/${id}`,
                dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
