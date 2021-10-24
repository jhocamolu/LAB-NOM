import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchivoTipo1PilaService {

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
  public getTipoAcciones(): Promise<any> {
    const urlEncode = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/tipoAcciones?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
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
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/reporte/ArchivoTipo1Pila`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
