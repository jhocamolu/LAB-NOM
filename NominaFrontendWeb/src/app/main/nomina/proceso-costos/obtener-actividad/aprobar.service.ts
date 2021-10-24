import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ObtenerActividadService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public actividadFuncionarios(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/ActividadFuncionarios`, dato, { observe: 'response' })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
