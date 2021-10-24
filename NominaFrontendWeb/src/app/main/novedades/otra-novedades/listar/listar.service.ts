import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ListarService {

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
          switch (decodeURIComponent(key)) {
            case 'criterioBusqueda':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
              break;
            case 'novedad':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`categoriaNovedad/nombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'fechaAplicacion':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaAplicacion ge ${decodeURIComponent(value)}`);
              break;
            case 'estado':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`estado eq '${decodeURIComponent(value)}'`);
              break;
            default:
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
          }

        }
      });
     
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
      
      this.urlFilters['$filter'] = this.urlFilters['$filter'] === true ? `estadoRegistro eq 'Activo'` : `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
    }
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'fechaAplicacion desc';
    }
    if (!this.urlFilters.hasOwnProperty('$filter')) {
      // tslint:disable-next-line: quotemark
      this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this._getOtraNovedades(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getOtraNovedades(): void {
    this._getOtraNovedades(this.urlFilters);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getOtraNovedades(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    
    // tslint:disable-next-line: max-line-length
    const url = `${environmentAlcanos.novedades}/odata/novedades?$count=true&$expand=funcionario($select=id,numeroDocumento,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda),categoriaNovedad($expand=conceptoNomina)&${toUrlEncoded(params)}`;
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



  public getShowTipoPeriodosId(id: number): Promise<any> {
    const param = encodeURI(`$filter=NovedadId eq ${id}&$count=true&$expand=subperiodo($expand=tipoperiodo),novedad&orderBy=id desc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.novedades}/odata/novedadsubperiodos?${param}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}

