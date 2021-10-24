import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

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
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */

  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults

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
        this.orderFilters['$orderBy'] = 'estadoFuncionario asc';
      }

    }

    return this._getEstados(this.id, this.paginadorFilters, this.orderFilters);

  }

  /**
   * @param resolve 
   * @id Id del concepto
   * @returns {Promise<any>}
   * Obtiene Todos los estados para llenar select asc Nombre
   */
  private _getEstados(id: number, paginador: any, order: any | null): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const filter = encodeURI(`$filter=tipoLiquidacionId eq ${id} and estadoRegistro eq 'Activo'&$expand=centroCosto($select=id,nombre,codigo),cuentaContable($select=id,nombre,cuenta,naturaleza)`);
    // const expand = encodeURI('$expand=conceptoNomina,subPeriodo,tipoContrato');

    let urlOrder = '';
    if (order !== null) {
      urlOrder = toUrlEncoded(order);
    }

    const url = `${environmentAlcanos.nomina}/odata/TipoLiquidacionComprobantes?$count=true&${filter}&${toUrlEncoded(paginador)}&${urlOrder}`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.totalCount.next(response['@odata.count']);
          this.dataRequest.next(false);
          resolve(response);
        }, reject);
    });
  }

  public eliminar(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/TipoLiquidacionComprobantes/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
