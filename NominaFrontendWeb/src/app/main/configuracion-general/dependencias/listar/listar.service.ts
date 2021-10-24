import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ListarService implements Resolve<any>{

  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;

  items: any[];
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
          if (decodeURIComponent(key) == 'codigo' || decodeURIComponent(key) == 'nombre') {
            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
            urlFilters.push(`contains(${decodeURIComponent(`DependenciaHijo/${key}`)}, '${decodeURIComponent(value)}')`);
          }
          if (decodeURIComponent(key) === 'dependenciaPadreId') {
            dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
            urlFilters.push(`${decodeURIComponent(`dependenciaPadreId`)} eq ${decodeURIComponent(value)}`);

          }
        }
      });

      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;

    }
    // ordenar asc y desc en segundo nivel //
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'nombre asc') {
        this.urlFilters.$orderBy = 'dependenciaHijo/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'nombre desc') {
        this.urlFilters.$orderBy = 'dependenciaHijo/nombre desc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'codigo asc') {
        this.urlFilters.$orderBy = 'dependenciaHijo/codigo asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'codigo desc') {
        this.urlFilters.$orderBy = 'dependenciaHijo/codigo desc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'dependencia asc') {
        this.urlFilters.$orderBy = 'dependenciaPadre/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'dependencia desc') {
        this.urlFilters.$orderBy = 'dependenciaPadre/nombre desc';
      }
    } else {
      this.urlFilters.$orderBy = 'dependenciaHijo/codigo asc';
    }




    return new Promise((resolve, reject) => {
      Promise.all([
        this._getDependencias(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getDependencias(): void {
    this._getDependencias(this.urlFilters);
  }
  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getDependencias(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependenciajerarquias?$expand=dependenciaHijo,dependenciapadre&$count=true&${toUrlEncoded(params)}`;
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
      this._httpClient.patch(`${environmentAlcanos.administracionPersonal}/api/dependencias/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
