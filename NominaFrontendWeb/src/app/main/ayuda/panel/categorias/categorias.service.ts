import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CategoriasService {

    constructor(
        private _httpClient: HttpClient
    ) { }


    private getChildCategoria(item: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`http://172.16.2.141:8083/odata/categorias?$filter=categoriaId eq ${item}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

}
