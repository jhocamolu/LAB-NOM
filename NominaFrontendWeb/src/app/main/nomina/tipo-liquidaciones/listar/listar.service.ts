import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ListarService implements Resolve<any> {

  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;

  items: any;
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */

  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.totalCount = 0;
    this.dataFilters = {};
    this.onItemsChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(false);
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.urlFilters = JSON.parse(JSON.stringify(route.queryParams));
    if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
      this.dataFilters = {};
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }

    if (this.urlFilters.hasOwnProperty('$filter')) {
      const dataFilters = {};
      const urlFilters = [];
      this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
        if (decodeURIComponent(value) !== 'null') {
          if (key === 'tipoPeriodoId') {
            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
            urlFilters.push(`tipoPeriodoId eq ${decodeURIComponent(value)}`);
          } else {
            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
            urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
          }

        }
      });
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'nombre asc';
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this._getTipoLiquidaciones(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getTipoLiquidaciones(): void {
    this._getTipoLiquidaciones(this.urlFilters);
  }
  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getTipoLiquidaciones(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/tipoliquidaciones?$count=true&$expand=tipoPeriodo&${toUrlEncoded(params)}`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.dataRequest.next(false);
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/tipoliquidaciones/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param resolve 
   * @returns {Promise<any>}
   * Obtiene Todos los tipo periodos para llenar select asc Nombre
   */
  getTipoPeriodoLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }



}
