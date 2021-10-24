import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class AutorizadoresMostrarService {

  id: any;
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
    this.items = [];
    this.onItemsChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(false);
  }

  public init(id: number): void {
    this.id = id;
    this.buildFilter({});
  }

  public buildFilter(filters): Promise<any> {
    this.urlFilters = JSON.parse(JSON.stringify(filters));
    this.dataFilters = {};
    if (filters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'cargoDependencia/dependencia/nombre asc';
    }
    return this._getAutorizadores(this.urlFilters);

  }  

  public getAutorizadores(): void{
    this._getAutorizadores(this.urlFilters);
  }

  private _getAutorizadores(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter= aplicacionExternaCargo/tipo eq 'Autorizacion' and aplicacionExternaCargoId eq ${this.id}`;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    // const paramsAdd = encodeURI(`$filter=tipo eq 'Aprobacion'`);
    const expand = encodeURI('$expand=aplicacionExternaCargo($expand=centroOperativoIndependiente,centroOperativoDependiente),cargoDependencia($expand=dependencia,cargo)');

    const url = `${environmentAlcanos.nomina}/odata/AplicacionExternaCargoDependientes?$count=true&${expand}&${filter}&${toUrlEncoded(params)}`;
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
