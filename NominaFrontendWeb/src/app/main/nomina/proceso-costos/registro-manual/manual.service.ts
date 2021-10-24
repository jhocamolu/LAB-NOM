import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ManualActividadService {

    constructor(
        private _httpClient: HttpClient
    ) { }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    public actividadFuncionarios(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.nomina}/api/ActividadFuncionarios`, dato, { observe: 'response' })
                .subscribe((response: any) => {
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
        const url = `${environmentAlcanos.nomina}/odata/funcionarios?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * 
     * @param value // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getCargos(filtro: number): Promise<any> {
        const filterNombre = `contains(nombre, '${filtro}')`;
        const orderby = `$orderby=nombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo' and costoSicom eq true`;
        const select = `$select=id,nombre,codigo,costoSicom`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/cargos?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }


    public getCentroOperativos(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/CentroOperativos?$orderBy=nombre`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    public getFechaCorteFuncionarios(): Promise<any> {
        return new Promise((resolve, reject) => {
            const elementos = encodeURI(`$orderBy=fechaCorte desc&$top=1&$select=id,fechaCorte&$count=true`);
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/FuncionarioCentroCostos?${elementos}`)
                .subscribe((response: any) => {
                    let totalCount = response['@odata.count'];
                    if(totalCount == 0){
                        resolve(response.value);
                    }else{
                        resolve(response.value[0]);
                    }
                }, reject);
        });
    }


    public getFechaCorteCargos(): Promise<any> {
        return new Promise((resolve, reject) => {
            const elementos = encodeURI(`$orderBy=fechaCorte desc&$top=1&$select=id,fechaCorte&$count=true`);
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/CargoCentroCostos?${elementos}`)
                .subscribe((response: any) => {
                    let totalCount = response['@odata.count'];
                    if(totalCount == 0){
                        resolve(response.value);
                    }else{
                        resolve(response.value[0]);
                    }
                }, reject);
        });
    }
}



