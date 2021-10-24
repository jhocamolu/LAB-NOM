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
   *
   * @returns {Promise<any>}
   */
  public getTipoAdministradoras(): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/tipoAdministradoras?$orderBy=nombre&$filter=estadoRegistro eq 'Activo'`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
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
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/administradoras`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
