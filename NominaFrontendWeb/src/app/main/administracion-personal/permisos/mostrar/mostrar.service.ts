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
    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    onSoportesChanged: BehaviorSubject<any>;



    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        // Set the defaults
        this.onItemsChanged = new BehaviorSubject({});

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
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getPermisos(this.id),
                this.getSoportePermisos(this.id)
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
    public getPermisos(id: number): Promise<any> {
        const uriParam = encodeURI('$expand=funcionario,tipoausentismo($expand=claseAusentismo)');
        const url = `${environmentAlcanos.novedades}/odata/SolicitudPermisos/${id}?${uriParam}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${url}`)
                .subscribe((response: any) => {
                    this.items = response;
                    this.onItemsChanged.next(this.items);
                    resolve(response);
                }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getSoportePermisos(id: number): Promise<any> {
        const param = encodeURI(`$filter=solicitudPermisoId eq ${id}&$expand=tiposoporte($select=id,nombre)&$count=true`); 
        const url = `${environmentAlcanos.novedades}/odata/SoporteSolicitudPermisos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    public _getSoportePermisosFile(): any {
        return this.getSoportePermisos(this.id); 
    }


}
