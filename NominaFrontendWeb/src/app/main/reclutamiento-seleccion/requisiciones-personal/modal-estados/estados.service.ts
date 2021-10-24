import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public estado(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/Candidatos/${id}/Estado`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
    return new Promise((resolve, reject) => {
      this._httpClient.post(url, formData)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
