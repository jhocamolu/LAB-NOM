import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

    id: any | null;

    item: any | null;
    onItemChanged: BehaviorSubject<any>;
    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.item = null;
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

        this.id = route.params.id;
        this.item = null;
        this.onItemChanged = new BehaviorSubject(null);

        const promises = [];
        if (this.id != null) {
            promises.push(this._getSustitutos(this.id));
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
     *
     * @returns {Promise<any>}
     */
    private _getSustitutos(id: number): Promise<any> {
        const expand = '$expand=cargoASustituir,cargoSustituto,centroOperativoASutituir,centroOperativoSustituto';
        const url = `${environmentAlcanos.configuracionGeneral}/odata/sustitutos/${id}?${expand}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.item = response;
                    this.onItemChanged.next(this.item);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getCargos(filtro: string): Promise<any> {
        const nombre = `contains(nombre, '${filtro}')`;
        const orderby = `$orderby=nombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${nombre}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,nombre,codigo,clase`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/cargos?${params}`;
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
    public getContratos(id: number): Promise<any> {
        const params = encodeURI(`$filter=estado eq 'Vigente' and funcionarioId eq ${id} and estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/?$count=true&${params}`;
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
    public getCentroOperativo(): Promise<any> {
        const params = encodeURI(`$orderby=nombre&$select=id,nombre,codigo`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/centrooperativos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    public upsert(dato: any): Promise<any> {
        if (this.item != null && this.id != null) {
            return this.editar(this.id, dato);
        }
        return this.crear(dato);
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    private editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/sustitutos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    private crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/sustitutos/`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }





}

