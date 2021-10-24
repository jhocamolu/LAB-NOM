import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearService {

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
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.ayuda}/api/articulos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getCategorias(): Promise<any> {
        const filter = encodeURI(
            `$filter=estadoRegistro eq 'Activo' and categoriaId eq null`
        );
        const expand = encodeURI(
            `$expand=categorias($filter=estadoRegistro eq 'Activo';$orderBy=nombre)`
        );
        const url = `${environmentAlcanos.ayuda}/odata/categorias?$orderBy=nombre&${filter}&${expand}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }
}
