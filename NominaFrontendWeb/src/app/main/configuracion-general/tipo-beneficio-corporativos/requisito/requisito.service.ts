import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class RequisitoService {

    constructor(
        private _httpClient: HttpClient
    ) { }

    
    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene Todas las Grados para llenar select asc Nombre
     */
    public getTipoSoportesLista(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tiposoportes?$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }
    
    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
             this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/tipobeneficiorequisitos`, dato, {responseType: 'text'})
                .subscribe((response: any) => {               
                    resolve(response);
                }, reject);
        });
    }
}
