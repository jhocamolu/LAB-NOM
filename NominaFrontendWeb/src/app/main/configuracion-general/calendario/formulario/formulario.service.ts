import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

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
   */
  public upsert(dato: any): Promise<any> {
    if (dato.id) {
      return this.editar(dato.id, dato);
    }
    return this.crear(dato);
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/calendarios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  private editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/calendarios/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
