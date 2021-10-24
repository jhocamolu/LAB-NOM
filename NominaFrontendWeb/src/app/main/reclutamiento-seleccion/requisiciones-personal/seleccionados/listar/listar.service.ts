import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class SeleccionadosListarService {

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

        if (decodeURIComponent(value) !== 'null') {
          switch (decodeURIComponent(key)) {
            case 'numeroDocumento':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`hojaDeVida/numeroDocumento`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'primerNombre':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`hojaDeVida/primerNombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'segundoNombre':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`hojaDeVida/segundoNombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'primerApellido':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`hojaDeVida/primerApellido`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'segundoApellido':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`hojaDeVida/segundoApellido`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'estado':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`estado eq '${decodeURIComponent(value)}'`);
              break;
          }
        }
      });

      urlFilters.push(`${decodeURIComponent(`requisicionPersonalId`)} eq ${decodeURIComponent(this.id)}and estado eq 'Seleccionado'`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;

      this.urlFilters['$filter'] = this.urlFilters['$filter'] === true ? `estadoRegistro eq 'Activo'` : `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'hojaDeVida/primerNombre asc';
    }

    // ordenar asc y desc en segundo nivel //
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
      if (this.urlFilters.$orderBy === 'hojaDeVida/nombre asc') {
        this.urlFilters.$orderBy = 'hojaDeVida/primerNombre asc';
      }
      if (this.urlFilters.$orderBy === 'hojaDeVida/nombre desc') {
        this.urlFilters.$orderBy = 'hojaDeVida/primerNombre desc';
      }

    }


    return this._getcandidatos(this.urlFilters);
  }

  private _getcandidatos(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=requisicionPersonalId eq ${this.id} and estado eq 'Seleccionado' and estadoRegistro eq 'Activo'`;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const paramsAdd = encodeURI(`$expand=requisicionPersonal,hojaDeVida($expand=tipoDocumento,sexo,ocupacion)&$count=true`);
    const url = `${environmentAlcanos.nomina}/odata/Candidatos?${paramsAdd}&${filter}&${toUrlEncoded(params)}`;
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

}
