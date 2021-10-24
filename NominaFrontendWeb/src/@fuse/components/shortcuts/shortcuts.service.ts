import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/_MenuFavoritos`, {
        itemMenu: dato
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  borrar(id: any): Promise<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { id: id },
    };
    const url = `${environmentAlcanos.configuracionGeneral}/api/_MenuFavoritos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url, options).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getMenuFavoritos(): Promise<any> {
    const url = `${environmentAlcanos.nomina}/odata/_MenuFavoritos`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getMenuFavoritosSolo(item: any): Promise<any> {
    const url = `${environmentAlcanos.nomina}/odata/_MenuFavoritos?$filter=itemMenu eq '${item}'`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}
