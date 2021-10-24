import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';

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
  ) { }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getAnnoLista(): Promise<any> {
    const params = encodeURI(`$orderby=anno desc&$filter=estadoRegistro eq 'Activo' and anno le ${moment().year() - 1}&$top=10`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/annoVigencias?${params}`)
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
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/reporte/MediosMagneticos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
