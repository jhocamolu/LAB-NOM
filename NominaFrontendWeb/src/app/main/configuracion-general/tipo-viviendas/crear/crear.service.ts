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

  /**este es el servicio
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/tipoViviendas`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
