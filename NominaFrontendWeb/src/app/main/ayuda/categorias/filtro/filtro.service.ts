import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {

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
   * @param response
   * @returns {Promise<any>}
   */
  getCategoriasLista(): Promise<any> {
    const params = encodeURI(
      'filter=categoriaId eq null&$orderBy=nombre asc'
    );
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(
          `${environmentAlcanos.ayuda}/odata/categorias?$${params}`
        )
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}
