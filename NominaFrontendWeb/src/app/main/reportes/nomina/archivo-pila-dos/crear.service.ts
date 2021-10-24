import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ArchivoTipo2PilaService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getPeriodoContables(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,fecha&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/periodoContables?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoPlantillas(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,codigo,requiereFechaPagoPlanilla,requiereNumeroPlanilla&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoPlanillas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoPlantillaSolo(id: number): Promise<any> {
    const params = encodeURI(`$select=id,nombre,codigo,requiereFechaPagoPlanilla,requiereNumeroPlanilla`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoPlanillas/${id}?${params}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoCotizantes(id: number): Promise<any> {
    const params = encodeURI(`$expand=tipoCotizante($select=id,nombre)&$filter=tipoplanillaId eq ${id} and tipoCotizante/estadoRegistro eq 'Activo'&$orderby=tipoCotizante/nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoCotizanteTipoPlanillas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoCotizanteSolo(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoCotizanteTipoPlanillas/${id}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getPeriodos(filtro: string): Promise<any> {
    const filterNombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,nombre,fecha`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/periodoContables?${params}`;
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
  public getSubtipoCotizantes(id: number): Promise<any> {
    const params = encodeURI(`$expand=subtipocotizante($select=id,nombre)&$filter=tipocotizanteId eq ${id} and subtipoCotizante/estadoRegistro eq 'Activo'&$orderby=subtipoCotizante/nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/TipoCotizanteSubtipoCotizantes?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getFuncionario(): Promise<any> {
    const params = encodeURI(`$select=id,criterioBusqueda&$filter=estado eq 'Activo'&$orderby=primerNombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/funcionarios?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=primerNombre asc`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios?${params}`;
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/reporte/ArchivoTipo2Pila`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
