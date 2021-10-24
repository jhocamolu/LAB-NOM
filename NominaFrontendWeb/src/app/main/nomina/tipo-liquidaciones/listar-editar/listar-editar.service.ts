import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ListarEditarService {

  id: any;

  /// variables para manejar paginacion y order
  paginadorFilters: any;
  orderFilters: any;
  page: number;
  dataFilters: any;
  urlFilters: any;

  // registros de la lista
  items: any[];
  totalCount: BehaviorSubject<number>;
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

  estadoContratos: any[];

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
    this.dataFilters = {};
  }

  public init(id: number): void {
    this.id = id;
    // 
    // this.paginadorFilters = {};
    // this.orderFilters = {};
    // this.totalCount.next(0);
    // this.onItemsChanged.next({});
    // this.dataRequest.next(true);
    this.buildFilter({});
  }

  public buildFilter(filters): Promise<any> {
    this.urlFilters = JSON.parse(JSON.stringify(filters));
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
            case 'codigo':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`conceptoNomina/codigo`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'nombre':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`conceptoNomina/nombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'subperiodo':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`subPeriodoId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'tipoContrato':
              if (value != null) {
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`${decodeURIComponent(`tipoContratoId`)} eq ${decodeURIComponent(value)}`);
              }
              break;
          }
        }
      });

      urlFilters.push(`${decodeURIComponent(`tipoliquidacionId`)} eq ${decodeURIComponent(this.id)}`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'conceptoNomina/orden asc';
    }
    return this._getConceptos(this.urlFilters);

  }


  private _getConceptos(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=tipoliquidacionId eq ${this.id} and estadoRegistro eq 'Activo'`;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const paramsAdd = encodeURI('$expand=conceptoNomina,subPeriodo,tipoContrato&$count=true');
    const url = `${environmentAlcanos.nomina}/odata/tipoliquidacionconceptos?${paramsAdd}&${filter}&${toUrlEncoded(params)}`;
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
    const url = `${environmentAlcanos.nomina}/api/tipoliquidacionconceptos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}



