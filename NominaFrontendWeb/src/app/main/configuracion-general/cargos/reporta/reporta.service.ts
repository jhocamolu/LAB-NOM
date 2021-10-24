import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class ReportaService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) { }

    // Filtro cargo Reporta -> V 4 ya modificada
    // public getCargoreportaFiltro(filtro: string, dependenciaId: number): Promise<any> {
    //     let dependencia = ''; 
    //     const filterNombre = `contains(cargo/nombre,'${filtro}')`;
    //     const orderby = `$orderby=cargo/nombre asc&$expand=cargo($select=id,nombre),dependencia($select=id,nombre)`;
    //     if (dependenciaId) {
    //         dependencia = `and dependenciaId eq ${dependenciaId}`;
    //     }
    //     const filter = `$filter=(${filterNombre}) ${dependencia}`;
    //     const params = encodeURI(`${orderby}&${filter}`);
    //     const url = `${environmentAlcanos.nomina}/odata/cargoDependencias?${params}`;
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get(url).subscribe((response: any) => {
    //             resolve(response.value);
    //         }, reject);
    //     });
    // }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/cargoreportas`, dato, { responseType: 'text' })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /* Versión 3*/
    // getDependenciaCargosLista(id: number): Promise<any> {
    //     const params = `$select=id,cargoId,dependenciaId,estadoRegistro&$expand=dependencia($select=id,codigo,nombre)&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'&$orderby=dependencia/nombre asc`; 
    //     return new Promise((resolve, reject) => {
    //         this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`)
    //             .subscribe((response: any) => {
    //                 resolve(response.value);
    //             }, reject);
    //     });
    // }

    getDependenciaCargosLista(): Promise<any> {
        const params = `$select=id,nombre,estadoRegistro&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    getCargoDependencia(id: number): Promise<any> {
        const params = `$select=id,cargoId,dependenciaId,estadoRegistro&$expand=dependencia($select=id,codigo,nombre)&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'&$orderby=dependencia/nombre asc`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    getDependenciaCargo(id: number): Promise<any> {
        const params = `$select=id,cargoId,dependenciaId,estadoRegistro&$expand=cargo($select=id,codigo,nombre)&$filter=dependenciaId eq ${id} and estadoRegistro eq 'Activo'&$orderby=cargo/nombre asc`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

}
