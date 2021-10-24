import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
  providedIn: 'root'
})
export class CrearConceptoService {


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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/tipoliquidacionconceptos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getConceptoNominaLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptonominas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  getTipoContratoLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoContratos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  getSubperiodoLista(tipoPeriodoId: number): Promise<any> {
    const params = encodeURI(` $orderby=nombre &$filter=tipoPeriodoId eq ${tipoPeriodoId} and estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/subperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  getSubperiodoFiltro(): Promise<any> {
    const params = encodeURI(` $orderby=nombre &$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/subperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}

