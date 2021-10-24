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
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/tipocontratos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  public getDocumentos(): Promise<any> {
    const params = encodeURI(`$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.documentos}/odata/documentos/?$count=true&${params}`;
    return new Promise((resolve, reject) => {
        this._httpClient.get(url).subscribe((response: any) => {
            resolve(response);
        }, reject);
    });
}
}
