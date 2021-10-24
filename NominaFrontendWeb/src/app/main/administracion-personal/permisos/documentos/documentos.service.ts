import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class DocumentosService {

    /**
     * @param _httpClient
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * @returns {Promise<any>}
     */
    public getTipoSoportes(): Promise<any> {
        const params = encodeURI(`$orderby=nombre`);
        const url = `${environmentAlcanos.novedades}/odata/tipoSoportes?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/SoporteSolicitudPermisos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    upload(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
        return new Promise((resolve, reject) => {
            this._httpClient.post(url, formData)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
