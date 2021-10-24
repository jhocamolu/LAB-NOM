import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';


declare var item: any;

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    allValues: any[] = [];
    constructor(
        private _httpClient: HttpClient
    ) { }



    public getAll(item: any): Promise<any> {
        return Promise.all([
            this.getChildArticulos(item), // 0 Articulos 1 Categorias
            this.getChildCategoria(item)]).then(values => {
                return values;
            });
    }


    getBuscar(item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const element: any = encodeURIComponent(item);
            if(element.length != 0){
                this._httpClient.get(`${environmentAlcanos.ayuda}/api/articulos/${element.trim()}`)
                .subscribe((response: any) => {
                    resolve(response.data);
                }, reject);
            }           
        });
    }

    public getHome(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/categorias?$expand=padre&$filter=estadoRegistro eq 'Activo' and categoriaId eq null`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    private getChildCategoria(item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/categorias?$expand=padre&$filter=categoriaId eq ${item} and estadoRegistro eq 'Activo'`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    private getChildArticulos(item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.ayuda}/odata/articulos?$filter=categoriaId eq ${item} and estadoRegistro eq 'Activo'`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

}
