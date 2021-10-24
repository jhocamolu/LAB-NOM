import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class EditarService {

    routeParams: any;
    router: Router;
    articulo: any[];
    onArticulosChanged: BehaviorSubject<any>;
    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.onArticulosChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getArticulo(this.routeParams.id),
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
     * @param id // Obtiene datos del articulo
     * @returns {Promise<any>}
     */
    private getArticulo(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/articulos/${id}`)
                .subscribe((response: any) => {
                    this.articulo = response;
                    this.onArticulosChanged.next(this.articulo);
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.ayuda}/api/articulos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getCategorias(): Promise<any> {
        const filter = encodeURI(
            `$filter=estadoRegistro eq 'Activo' and categoriaId eq null`
        );
        const expand = encodeURI(
            `$expand=categorias($filter=estadoRegistro eq 'Activo';$orderBy=nombre)`
        );
        const url = `${environmentAlcanos.ayuda}/odata/categorias?$orderBy=nombre&${filter}&${expand}`;        
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }
}
