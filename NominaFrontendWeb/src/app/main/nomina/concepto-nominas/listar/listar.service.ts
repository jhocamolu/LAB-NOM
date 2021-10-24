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

        switch (decodeURIComponent(key)) {
          case 'claseConceptoNomina':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`claseConceptoNomina`)} eq '${decodeURIComponent(value)}'`);
            }
            break;
          case 'tipoConceptoNomina':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`tipoConceptoNomina`)} eq '${decodeURIComponent(value)}'`);
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
    // Ordenar en primer nivel
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'claseConceptoNomina desc';
    }
    return new Promise((resolve, reject) => {
      Promise.all([
        this._getConceptoNominas(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getConceptoNominas(): void {
    this._getConceptoNominas(this.urlFilters);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getConceptoNominas(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/conceptonominas?${toUrlEncoded(params)}&$count=true`;
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
   * 
   * @returns {Promise<any>}
   */
  public getClaseConceptonominas(): Promise<any> {
    return new Promise((resolve, reject) => {
      const items = [
        {
          id: 'Devengo',
          nombre: 'Devengo',
        },
        {
          id: 'Deduccion',
          nombre: 'Deducción',
        },
        {
          id: 'Calculo',
          nombre: 'Cálculo',
        }
      ];
      resolve(items);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoConceptoNominas(): Promise<any> {
    return new Promise((resolve, reject) => {
      const items = [
        {
          id: 'Fijo',
          nombre: 'Fijo',
        },
        {
          id: 'Novedad',
          nombre: 'Novedad',
        },
      ];

      resolve(items);
    });
  }


  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/conceptonominas/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
