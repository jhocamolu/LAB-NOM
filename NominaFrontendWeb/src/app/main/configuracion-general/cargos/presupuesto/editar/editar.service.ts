import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
    providedIn: 'root'
})
export class PresupuestoEditarService {
    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) { }


    public getAnnoVigencia(): Promise<any> {
        const params = encodeURI(`$select=id,anno,estado&$filter=estado eq 'Vigente'`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/annoVigencias?${params}`)
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
    public editar(id: number, dato: any): Promise<any> {
        dato["cargoId"] = dato.cargoId;
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/CargoPresupuestos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
