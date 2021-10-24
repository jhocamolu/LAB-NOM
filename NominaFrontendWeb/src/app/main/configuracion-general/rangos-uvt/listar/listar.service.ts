import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';

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
    this.dataFilters = {};
    if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }

    if (this.urlFilters.hasOwnProperty('$filter')) {
      const dataFilters = {};
      const urlFilters = [];
      this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
        switch (decodeURIComponent(key)) {
          case 'desde':
            if (value !== 'null' && !isNaN(parseInt(value.trim(), 10))) {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`desde`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          case 'hasta':
            if (value !== 'null' && !isNaN(parseInt(value.trim(), 10))) {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`hasta`)} le ${decodeURIComponent(value)}`);
            }
            break;
          case 'validoDesde':
            if (decodeURIComponent(value) != 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`validoDesde ge ${moment(decodeURIComponent(value)).format('YYYY-MM-DD')}`);
            }
            break;
          // case 'validoDesde':
          //   dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
          //   urlFilters.push(`validoDesde ge ${decodeURIComponent(value)}`);
          //   break;

          // case 'adiciona':
          //   dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
          //   urlFilters.push(`${decodeURIComponent(`adiciona`)} eq '${decodeURIComponent(value)}'`);
          //   break;

          // case 'sustrae':
          //   dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
          //   urlFilters.push(`${decodeURIComponent(`sustrae`)} eq '${decodeURIComponent(value)}'`);
          //   break;

          case 'porcentaje':
            if (value !== 'null' && !isNaN(parseInt(value.trim(), 10))) {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`porcentaje`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          default:
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
        }

      });
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'desde asc' && 'validoDesde desc';
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getRangosUvt(this.urlFilters)
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
  public getRangosUvt(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const urlParams = encodeURI(``);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/RangoUvts?${urlParams}&$count=true&${toUrlEncoded(params)}`;
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
      this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/RangoUvts/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}

