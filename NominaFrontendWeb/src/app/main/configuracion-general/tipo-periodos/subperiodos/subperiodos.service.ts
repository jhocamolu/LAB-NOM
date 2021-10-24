import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class SubperiodoService {

  id: any;

  /// variables para manejar paginacion y order
  paginadorFilters: any;
  orderFilters: any;
  page: number;

  // registros de la lista
  items: any[];
  totalCount: BehaviorSubject<number>;
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {

    this.items = [];
    this.totalCount = new BehaviorSubject(0);
    this.onItemsChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(true);

    this.paginadorFilters = {};
    this.orderFilters = {};
  }

  public init(id: number): void {
    this.id = id;
    this.paginadorFilters = {};
    this.orderFilters = {};
    this.totalCount.next(0);
    this.onItemsChanged.next({});
    this.dataRequest.next(true);
    this.buildFilter({});
  }

  public buildFilter(filters): Promise<any> {

    if (filters.hasOwnProperty('$top') === false || filters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.paginadorFilters['$top'] = 5;
      this.paginadorFilters['$skip'] = 0;
    } else {
      this.paginadorFilters['$top'] = filters['$top'];
      this.paginadorFilters['$skip'] = filters['$skip'];
      this.page = Math.round(this.paginadorFilters['$skip'] / this.paginadorFilters['$top']);
    }

    if (filters.hasOwnProperty('$orderBy')) {
      this.orderFilters['$orderBy'] = filters['$orderBy'];
    } else {
      if (this.orderFilters['$orderBy'] === null) {
        this.orderFilters['$orderBy'] = 'nombre asc';
      }

    }

    return this._getSubperiodos(this.id, this.paginadorFilters, this.orderFilters);

  }


  /**
   * @param resolve 
   * @id Id del Subperiodos
   * @returns {Promise<any>}
   * Obtiene Todos los subperiodos para llenar select asc Nombre
   */
  private _getSubperiodos(id: number, paginador: any, order: any | null): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const filter = encodeURI(`$filter=tipoPeriodoId eq ${id}`);
    // const expand = encodeURI('$expand=conceptoNomina');
    let urlOrder = '';
    if (order !== null) {
      urlOrder = toUrlEncoded(order);
    }
    const url = `${environmentAlcanos.configuracionGeneral}/odata/SubPeriodos?$count=true&${filter}&${toUrlEncoded(paginador)}&${urlOrder}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.totalCount.next(response['@odata.count']);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/SubPeriodos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
