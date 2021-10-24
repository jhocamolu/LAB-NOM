import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class FiltroService {

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
    }

    /**
     *
     * @returns {Promise<any>}
     */
    public getGrupos(): Promise<any> {
        const params = encodeURI(
            `$filter=estadoRegistro eq 'Activo'`
        );
        const url = `${environmentAlcanos.plantillas}/odata/grupodocumentos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

}