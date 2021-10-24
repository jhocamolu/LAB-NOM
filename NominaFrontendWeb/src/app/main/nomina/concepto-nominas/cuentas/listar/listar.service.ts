import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class CuentasListarService {
  
  id: any;
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;
  onCuentaContableChanged: BehaviorSubject<any>;
  onCentroCostosChanged: BehaviorSubject<any>;
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
    this.onCuentaContableChanged = new BehaviorSubject({});
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
        if (value !== 'null') {
          if (key === 'centroCostoId') {
            dataFilters[key] = value;
            urlFilters.push(`contains(${decodeURIComponent(`centroCosto/nombre`)}, '${decodeURIComponent(value)}')`);
            //urlFilters.push(`contains(centroCosto/nombre,'${value}')`);
          } else if (key === 'codigo') {
            dataFilters[key] = value;
            urlFilters.push(`contains(${decodeURIComponent(`centroCosto/codigo`)}, '${decodeURIComponent(value)}')`);
            //urlFilters.push(`contains(centroCosto/codigo,'${value}')`);
          } else if (key === 'cuentaContableId') {
            dataFilters[key] = value;
            urlFilters.push(`contains(cuentaContable/cuenta,'${value}')`);
          } else {
            dataFilters[key] = value;
            urlFilters.push(`contains(cast(${key}, 'Edm.String'),'${value}')`);
          }
        }
      });
      urlFilters.push(`${decodeURIComponent(`conceptoNominaId`)} eq ${decodeURIComponent(this.id)}`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
     
    }

    // ordenar asc y desc en segundo nivel //
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'cuentaContableId asc') {
        this.urlFilters.$orderBy = 'cuentaContable/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'cuentaContableId desc') {
        this.urlFilters.$orderBy = 'cuentaContable/nombre desc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'centroCosto/nombre asc') {
        this.urlFilters.$orderBy = 'centroCosto/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'centroCosto/nombre desc') {
        this.urlFilters.$orderBy = 'centroCosto/nombre desc';
      }

      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'cuentaContable/naturaleza asc') {
        this.urlFilters.$orderBy = 'cuentaContable/naturaleza asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'cuentaContable/naturaleza desc') {
        this.urlFilters.$orderBy = 'cuentaContable/naturaleza desc';
      }
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'centroCosto/nombre asc';
    }
    return this._getCuentaDebitos(this.urlFilters);


  }

  private _getCuentaDebitos(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=conceptoNominaId eq ${this.id}`;
    }
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/conceptoNominaCuentaContables?$expand=centrocosto,CuentaContable&$count=true&${filter}&${toUrlEncoded(params)}`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCentroCostos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre`);
    const url = `${environmentAlcanos.nomina}/odata/centrocostos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }


  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean, idConceptoNomina: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/conceptoNominaCuentaContables/${id}`, {
        id: id,
        activo: activo,
        conceptoNominaId: idConceptoNomina
      })
        .subscribe((response: any) => {
          
          resolve(response);
        }, reject);
    });
  }



}



