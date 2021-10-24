import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DiaService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {}

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/JornadaLaboralDias`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
