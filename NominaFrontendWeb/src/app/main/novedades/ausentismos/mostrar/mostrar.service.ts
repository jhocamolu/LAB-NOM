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
        this._getAusentismoFuncionario(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getAusentismoFuncionario(): any {
    return this._getAusentismoFuncionario(this.id);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public _getAusentismoFuncionario(id: number): Promise<any> {
    const expand = '$expand=ausentismoDe,funcionario,tipoAusentismo($expand=claseAusentismo),diagnosticoCie';
    const url = `${environmentAlcanos.novedades}/odata/AusentismoFuncionarios/${id}?${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getProrroga(prorrogaId: number): Promise<any> {
    // tslint:disable-next-line: max-line-length
    const url = `${environmentAlcanos.novedades}/odata/prorrogaausentismos/${prorrogaId}?$expand=prorroga($expand=diagnosticoCie)`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
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
    const params = encodeURI(`$select=id&$expand=nominaFuenteNovedad($select=id,moduloRegistroId,modulo)&$filter=Estado eq 'Pendiente' and nominaFuenteNovedad/moduloRegistroId eq ${id} and nominaFuenteNovedad/modulo eq 'Ausentismos'&$count=true`);
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
