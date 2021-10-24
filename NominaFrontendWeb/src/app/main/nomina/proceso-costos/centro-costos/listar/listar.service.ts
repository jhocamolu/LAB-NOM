import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CentroCostosListarService {

  id: any;
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  onCentroCostosChanged: BehaviorSubject<any>;
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
    this.totalCount = 0;
    this.dataFilters = {};
    this.items = [];
    this.onItemsChanged = new BehaviorSubject({});
    this.onCentroCostosChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(false);
  }

  public init(id: number): void {
    this.id = id;
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
        switch (decodeURIComponent(key)) {         
          case 'codigoCentrodeCostos':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`actividadCentroCosto/centroCosto/codigo`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
          case 'centrodeCostos':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`actividadCentroCosto/centroCosto/nombre`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
          case 'cantidad':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`cantidad`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          case 'fechaCorte':
            if (decodeURIComponent(value) != 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaCorte eq ${moment(decodeURIComponent(value)).format('YYYY-MM-DD')}`);
            }
            break;
        }
      });
      urlFilters.push(`${decodeURIComponent(`funcionarioId`)} eq ${decodeURIComponent(this.id)}`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'fechaCorte desc';
    }

    return this._getFuncionarioCentroCostos(this.urlFilters);
  }

  private _getFuncionarioCentroCostos(params: any): Promise<any> {
    this.getCentroCostos();
    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `&$filter=funcionarioId eq ${this.id}`;
    }
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const element = `$expand=actividadCentroCosto($expand=centroCosto,actividad)&$count=true`;
    const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioCentroCostos?${element}${filter}&${toUrlEncoded(params)}`;
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
  public getCentroCostos(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,codigo,estadoRegistro&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrocostos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroCostosChanged.next(response.value);
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getCentroCostosSolo(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrocostos?${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

}



