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
          switch (decodeURIComponent(key)) {
            case 'revisa':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`revisa eq '${decodeURIComponent(value)}'`);
              break;
            case 'aprueba':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`aprueba eq '${decodeURIComponent(value)}'`);
              break;
            case 'autoriza':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`autoriza eq '${decodeURIComponent(value)}'`);
              break;
            default:
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
              break;
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
        this.getAplicacionesExternas(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getAplicacionesExternas(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/AplicacionExternas?$count=true&${toUrlEncoded(params)}`;
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



}
