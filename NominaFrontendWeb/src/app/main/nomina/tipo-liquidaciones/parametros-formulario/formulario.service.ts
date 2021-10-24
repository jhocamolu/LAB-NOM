import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FormularioParametroService {

  id: number;
  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {

  }

  public getCuentaContablesFiltro(filtro: string): Promise<any> {
    let params = encodeURI(``);
    if (filtro != '') {
      const filterNombre = `contains(nombre,'${filtro}')`;
      const filterCuenta = `contains(cuenta,'${filtro}')`;
      const orderby = `$orderby=nombre`;
      const filter = `$filter=(${filterNombre} or ${filterCuenta})`; //and naturaleza eq 'Credito'
      params = encodeURI(`?${orderby}&${filter}`);
    }
    const url = `${environmentAlcanos.nomina}/odata/cuentacontables${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  public getCentroCostosFiltro(filtro: string): Promise<any> {
    let params = encodeURI(``);
    if (filtro != '') {
      const filterCodigo = `contains(codigo,'${filtro}')`;
      const filterNombre = `contains(nombre,'${filtro}')`;
      const orderby = `$orderby=nombre`;
      const filter = `$filter=(${filterNombre} or ${filterCodigo})`;
      params = encodeURI(`?${orderby}&${filter}`);
    }
    const url = `${environmentAlcanos.nomina}/odata/centrocostos${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }



  public upsert(dato: any): Promise<any> {
    if (dato.id) {
      return this._editar(dato);
    }
    return this._crear(dato);
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/TipoLiquidacionComprobantes`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private _editar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/TipoLiquidacionComprobantes/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}



////