import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearAusentismoLaboralService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) { }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getCentroOperativos(): Promise<any> {
        const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/centrooperativos?${params}`;
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
    public getDependencias(): Promise<any> {
        const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
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
    public getCargo(): Promise<any> {
        const params = encodeURI(`$select=id,nombre&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @param value // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getSoloCargo(filtro: number): Promise<any> {
        const filterNombre = `contains(nombre, '${filtro}')`;
        const orderby = `$orderby=nombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,nombre`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getClaseAusentismos(): Promise<any> {
        const params = encodeURI(`$orderby=nombre`);
        const url = `${environmentAlcanos.novedades}/odata/claseAusentismos?${params}`;
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
    public getTipoAusentismos(claseId: number): Promise<any> {
        const params = encodeURI( `$orderby=nombre&$filter=claseAusentismoId eq ${claseId} and estadoRegistro eq 'Activo'` );
        const url = `${environmentAlcanos.novedades}/odata/tipoAusentismos?${params}`;
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
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/reporte/AusentismoLaboral`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
