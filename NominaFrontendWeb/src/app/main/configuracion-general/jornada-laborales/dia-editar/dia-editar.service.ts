import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


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
    ) {

    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/JornadaLaboralDias/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
