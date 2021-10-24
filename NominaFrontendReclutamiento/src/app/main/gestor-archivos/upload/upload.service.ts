import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
  }

  delete(id: string): Promise<any> {
    const url = `${environmentAlcanos.gestorArchivos}/bucket/delete?document_id=${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
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

  public _getAspirante(numerdoDocumento: number): Promise<any> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$expand=tipoDocumento,sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,LicenciaConduccionA,LicenciaConduccionB,LicenciaConduccionC,TipoSangre`;
    const url = `${environmentAlcanos.portal}/odata/Custom/_HojaDeVidas/${params}&$filter= numeroDocumento  eq '${numerdoDocumento}'`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  public imagenHojaVida(hojaVida: any): Promise<any> {
    const url = `${environmentAlcanos.portal}/reclutamiento/HojaDeVidas/${hojaVida.id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.patch(url,hojaVida).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }
}