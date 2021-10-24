import { Injectable } from '@angular/core';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class DocumentosService implements Resolve<any> {

    itemFuncionario: any;
    onItemFuncionarioChanged: BehaviorSubject<any>;

    //
    onTipoSoportesChanged: BehaviorSubject<any[]>;


    /**
     *
     * @param _httpClient
     */
    constructor(private _httpClient: HttpClient) {
        // Set the defaults
        this.onItemFuncionarioChanged = new BehaviorSubject({});
        this.onTipoSoportesChanged = new BehaviorSubject([]);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        this.itemFuncionario = null;
        this.onItemFuncionarioChanged = new BehaviorSubject({});
        return new Promise((resolve, reject) => {
            Promise.all(
                [
                    this.getTipoSoportes(),
                    this.getFuncionario(route.params.id)
                ]
            ).then(
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
    private getFuncionario(id: number): Promise<any> {
        const params =
            `$expand=tipoDocumento,TipoSangre,sexo,ocupacion`;
        const url = `${environmentAlcanos.administracionPersonal}/odata/HojaDeVidas/${id}?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.itemFuncionario = response;
                this.onItemFuncionarioChanged.next(this.itemFuncionario);
                resolve(response);
            }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getTipoSoportes(): Promise<any> {
        const params = encodeURI(`$orderby=nombre`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/tipoSoportes?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onTipoSoportesChanged.next(response.value);
                resolve(response);
            }, reject);
        });
    }



    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/HojadeVidaDocumentos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    upload(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
        return new Promise((resolve, reject) => {
            this._httpClient.post(url, formData)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
