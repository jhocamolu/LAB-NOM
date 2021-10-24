import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class HeaderService {


    constructor(
        private _httpClient: HttpClient
    ) { }

    /**
      * 
      * @param id 
      * @returns {Promise<any>}
      */
    public getIdNomina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}