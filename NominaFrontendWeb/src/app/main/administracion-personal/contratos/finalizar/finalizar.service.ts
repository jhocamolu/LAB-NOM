import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FinalizarService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCausalTerminaciones(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const expand = `$select=id,nombre,codigo,estadoRegistro`
    const url = `${environmentAlcanos.administracionPersonal}/odata/CausalTerminaciones?${params}&${expand}`;
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
  public finalizar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/Contratos/finalizar/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
