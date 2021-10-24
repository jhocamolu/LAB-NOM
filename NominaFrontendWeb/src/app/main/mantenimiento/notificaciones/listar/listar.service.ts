import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class ListarService implements Resolve<any> {


  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  filtroValidado: boolean;
  eleccion: any;
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
        if (decodeURIComponent(value) !== 'null') {
          switch (decodeURIComponent(key)) {
            case 'tipo':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`tipo`)} eq '${decodeURIComponent(value)}'`);
              break;
            case 'fecha':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              // Formato de fecha aprobado
              urlFilters.push(`contains(cast(${decodeURIComponent(`fecha`)}, 'Edm.String'), '${moment(decodeURIComponent(value)).format(`YYYY-MM-DD`)}')`);
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
      this.urlFilters.$orderBy = 'titulo asc';
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getNotificaciones(this.urlFilters)
      ]).then(
        response => {
          resolve(response);
        },
        reject
      );
    });
  }


  public getNotificaciones(): void {
    this._getNotificaciones(this.urlFilters);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getNotificaciones(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.administracionPersonal}/odata/notificaciones?$count=true&${toUrlEncoded(params)}`;
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


  ejecutar(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/notificaciones/${id}/ejecutar`;
    return new Promise((resolve, reject) => {
      this._httpClient.post(url, {})
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });

  }
}
