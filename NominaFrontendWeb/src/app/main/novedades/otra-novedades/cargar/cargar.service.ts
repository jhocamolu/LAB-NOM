import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CargarService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {

    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getNovedades(filtro: string): Promise<any> {
        const nombre = `contains(nombre, '${filtro}')`;
        const orderby = `$select=id,nombre,usaParametrizacion,requiereTercero,clase,estadoRegistro,modulo&$orderby=nombre`;
        const expand = `$expand=conceptoNomina`;
        const filter = `$filter=(${nombre}) and usaParametrizacion eq true and estadoRegistro eq 'Activo' and clase eq 'Eventual'`;
        const params = encodeURI(`${orderby}&${filter}&${expand}`);
        const url = `${environmentAlcanos.novedades}/odata/categoriaNovedades?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * @param id
     * @returns {Promise<any>}
     */
    public getSubPeriodoSolo(id: number): Promise<any> {
        const params = encodeURI(`$select=id,nombre,tipoPeriodoId`);
        const url = `${environmentAlcanos.novedades}/odata/subperiodos/${id}?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    /**
     * @param id
     * @returns {Promise<any>}
     */
    public getPeriodoContable(): Promise<any> {
        const params = encodeURI(`$filter=estado eq 'Activo' and estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.novedades}/odata/PeriodoContables?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * @param id
     * @returns {Promise<any>}
     */
    public getSubPeriodos(id: number): Promise<any> {
        const params = encodeURI(`$filter=tipoPeriodoId eq ${id}`);
        const url = `${environmentAlcanos.novedades}/odata/subperiodos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     *  PERIODO DE PAGO
     * @returns {Promise<any>}
     */
    public getTipoPeriodos(): Promise<any> {
        // const params = encodeURI(`$filter=estadoRegistro eq 'Activo' and pagoPorDefecto eq true`);
        const url = `${environmentAlcanos.novedades}/odata/TipoPeriodos?$filter=pagoPorDefecto eq true&$count=true&$orderby=nombre asc`;
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
    cargar(dato: any, validar: boolean): Promise<any> {
        let type = null;
        if (!validar) {
            type = { resonseType: 'application/json' };
        } else {
            type = { responseType: 'blob' };
        }
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/novedades/cargar`, dato, type)
                .subscribe((response: any) => {
                    console.log(response);
                    console.clear();
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
