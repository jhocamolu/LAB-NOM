import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class CrearService {

  constructor(
    private _httpClient: HttpClient
  ) { }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/reporte/ProrrogaContratoTerminoFijo`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoContratos(): Promise<any> {
    const params = encodeURI(`$select=id,nombre&$orderby=nombre asc&$filter=terminoIndefinido eq false`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/TipoContratos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCentroOperativos(): Promise<any> {
    const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrooperativos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getDependencias(): Promise<any> {
    const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCargo(): Promise<any> {
    const params = encodeURI(`$select=id,nombre&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @param value // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getSoloCargo(filtro: number): Promise<any> {
    const filterNombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,nombre`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });

  }
}
