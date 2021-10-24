import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearService {

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
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/cargos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
