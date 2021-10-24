
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { codigoPermisosAlcanos } from '@alcanos/constantes/estado-permisos';


@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

    id: number | null;
    item: any | null;
    changed: any;

    totalCount: number;
    items: any;
    path: any;

    selectedTab: number;

    // BehaviorSubject
    onItemChanged: BehaviorSubject<any>;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the defaults
        this.onItemChanged = new BehaviorSubject(null);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.id = null;
        this.item = null;
        route.url.map((resp) => {
            this.path = resp.path;
        });

        if (route.queryParams.tab != null) {
            this.selectedTab = route.queryParams.tab;
        } else {
            this.selectedTab = 0;
        }

        this.onItemChanged = new BehaviorSubject(null);
        const promises = [];
        if (route.params.id != null) {
            this.id = route.params.id;
            promises.push(this.getSolicitudPermisos(this.id));
            promises.push(this._getSoportePermisos(this.id));
        }

        return new Promise((resolve, reject) => {
            Promise.all(promises).then(
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
    public getSolicitudPermisos(id: number): Promise<any> {
        const uriParam = encodeURI('$expand=funcionario,tipoausentismo($expand=claseAusentismo)');
        const url = `${environmentAlcanos.novedades}/odata/SolicitudPermisos/${id}?${uriParam}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.item = response;
                this.onItemChanged.next(this.item);
                resolve(response);
            }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getFuncionarios(filtro: string): Promise<any> {
        const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
        const orderby = `$orderby=primerNombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,criterioBusqueda`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
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
    public getClaseAusentismo(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=codigo ne '${codigoPermisosAlcanos.incapacidad}'`);
        const url = `${environmentAlcanos.novedades}/odata/ClaseAusentismos?${params}`;
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
    public getClaseRequiereHora(id: number): Promise<any> {
        const params = encodeURI(`$select=id,requiereHora,nombre`);
        const url = `${environmentAlcanos.novedades}/odata/ClaseAusentismos/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getTipoAusentismos(id: number): Promise<any> {
        const param = encodeURI(`$filter=claseAusentismoId eq ${id}&$orderBy=nombre asc`);
        const url = `${environmentAlcanos.novedades}/odata/TipoAusentismos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


    public getSoportePermisos(): any {
        return this._getSoportePermisos(this.id);
    }
    /**
     * 
     * @returns {Promise<any>}
     */
    public _getSoportePermisos(id: number): Promise<any> {
        const param = encodeURI(`$filter=solicitudPermisoId eq ${id}&$expand=tiposoporte($select=id,nombre)&$count=true`);
        const url = `${environmentAlcanos.novedades}/odata/SoporteSolicitudPermisos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getDatosActuales(id: number): Promise<any> {
        const urlEncode = encodeURI(`$expand=contrato`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    borrar(id: number): Promise<any> {
        const url = `${environmentAlcanos.novedades}/api/SoporteSolicitudPermisos/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.delete(url)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    public upsert(dato: any): Promise<any> {
        if (this.item !== null && this.id !== null) {
            return this._editar(this.item.id, dato);
        }
        return this._crear(dato);
    }

    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    private _editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.novedades}/api/SolicitudPermisos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    private _crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/SolicitudPermisos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}