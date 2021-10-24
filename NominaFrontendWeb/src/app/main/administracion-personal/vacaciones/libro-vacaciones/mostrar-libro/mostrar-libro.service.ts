import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarLibroService implements Resolve<any> {

  id: number;
  //
  interrupcionesCount: number;

  //
  onContratoChanged: BehaviorSubject<any>;


  totalCount: number;
  urlFilters: any;

  page: number;
  dataFilters: any;

  // registros de la lista
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
    this.onContratoChanged = new BehaviorSubject({});
    this.items = [];
    this.totalCount = 0;
    this.interrupcionesCount = 0;
    this.onItemsChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(true);

    this.dataFilters = {};
  }


  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = route.params.id;
    this.onContratoChanged.next({});
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
          dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
          urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
        }
      });

      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this.getVacaciones(this.id, this.urlFilters),
        this.getLibroVAcaciones(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }



  /**
   * @param resolve 
   * @id Id del concepto
   * @returns {Promise<any>}
   * Obtiene Todos los estados para llenar select asc Nombre
   */
  public getVacaciones(id: number, params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const expand = encodeURI(`$filter=funcionarioId eq ${id}`);
    const url = `${environmentAlcanos.nomina}/odata/LibroVacaciones?$count=true&${expand}&${toUrlEncoded(params)}`;
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
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getLibroVAcaciones(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/LibroVacaciones?$filter=funcionarioId eq ${id}&$expand=contrato($expand=funcionario)&$count=true&$orderby=inicioCausacion desc`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onContratoChanged.next(response);
        resolve(response);
      }, reject);
    });
  }


  public getSolicitudVacaciones(idLibroVacaciones: any): Promise<any> {
    const uriParam = encodeURI(`$expand=funcionario,libroVacaciones&$filter=libroVacacionesId eq ${idLibroVacaciones}&$count=true`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/SolicitudVacaciones?${uriParam}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getInterrupciones(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/SolicitudVacacionesInterrupciones/?$filter=solicitudVacacionesId eq ${id}&$count=true`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.interrupcionesCount = response['@odata.count'];
        resolve(response);
      }, reject);
    });
  }


}
