import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

  id: number;
  item: any;
  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient,
  ) { }


  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = route.params.id;
    return new Promise((resolve, reject) => {
      Promise.all([
        this._getLibranzas(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getLibranzas(): any {
    return this._getLibranzas(this.id);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public _getLibranzas(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/libranzas/${id}?$expand=funcionario,entidadFinanciera`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
          resolve(response);
        }, reject);
    });
  }


  public getShowTipoPeriodosId(id: number): Promise<any> {
    const param = encodeURI(`$filter=libranzaId eq ${id}&$count=true&$expand=subperiodo($expand=tipoperiodo)&orderBy=id desc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/LibranzaSubperiodos?${param}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getAusentismoPeriodoLiquidacion(id: number): Promise<any> {
    const params = encodeURI(`$select=id&$expand=nominaFuenteNovedad($select=id,moduloRegistroId,modulo)&$filter=Estado eq 'Pendiente' and nominaFuenteNovedad/moduloRegistroId eq ${id} and nominaFuenteNovedad/modulo eq 'Libranzas'&$count=true`);
    // tslint:disable-next-line: max-line-length
    const url = `${environmentAlcanos.novedades}/odata/nominaDetalles?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
