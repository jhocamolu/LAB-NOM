import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearService {

    id: number;

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) { }


    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los conceptos de nómina para cargar el select
     */
    public getConceptoNomina(): Promise<any> {
        const params = encodeURI(`$filter=claseConceptoNomina eq 'Deduccion' and estadoRegistro eq 'Activo'&$orderBy=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }


    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los datos del concepto de Calculo añadido
     */
    public getConceptoNominaCalculo(id: number): Promise<any> {
        const params = encodeURI(`$expand=conceptoNomina,tipoEmbargo&$filter=tipoEmbargoId eq ${id}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/tipoembargos/`,
                dato).subscribe((response: any) => { resolve(response); }, reject);
        });
    }

}
