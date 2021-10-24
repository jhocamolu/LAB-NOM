import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
    providedIn: 'root'
})
export class VentanaService {

    constructor(
        private _httpClient: HttpClient
    ) { }


    public getListaArticulos(item: any): Promise<any> {
        const params = encodeURI(`$expand=categoria($select=id,nombre)&$filter=categoriaId eq ${item} and estadoRegistro eq 'Activo'`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/articulos?${params}`)
            .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }
//
    public getSoloArticulo(item: any): Promise<any> {
        const params = encodeURI(`$expand=categoria($select=id,nombre)&$filter=id eq ${item} and estadoRegistro eq 'Activo'`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/articulos?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }


    public getChildCategoria(item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/categorias/${item}?$expand=padre`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}