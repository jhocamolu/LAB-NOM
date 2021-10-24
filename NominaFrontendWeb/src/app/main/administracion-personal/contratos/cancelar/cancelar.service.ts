import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CancelarService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public cancelar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/Contratos/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
