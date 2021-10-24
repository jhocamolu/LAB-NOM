import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EditarService {

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
      this._httpClient.put(`${environmentAlcanos.ayuda}/api/categorias/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   *
   * @param response
   * @returns {Promise<any>}
   */
  getCategoriasLista(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=categoriaId eq null and id ne ${id}&$orderBy=nombre asc`
    );
    const url = `${environmentAlcanos.ayuda}/odata/categorias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

}
