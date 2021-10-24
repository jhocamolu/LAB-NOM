import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class GradoService {
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
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        dato["cargoId"] = dato.cargoId;
        return new Promise((resolve, reject) => {
             this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/CargoGrados`, dato, {responseType: 'text'})
                .subscribe((response: any) => {               
                    resolve(response);
                }, reject);
        });
    }
}
