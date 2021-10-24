import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
  providedIn: 'root'
})
export class EditarRetefuenteService {

  /**
   *
   * @param  {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/DeduccionRetefuentes/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getAnnoLista(): Promise<any> {
    const params = encodeURI(`$orderby=anno desc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/annoVigencias?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}
