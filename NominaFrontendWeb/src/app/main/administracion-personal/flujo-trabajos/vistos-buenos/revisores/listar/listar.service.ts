import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class RevisoresListarService {

  id: any;
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

  onDependenciaCargosChange: BehaviorSubject<any[]>;
  onCentroOperativosChange: BehaviorSubject<any[]>;
  onCargosChange: BehaviorSubject<any[]>;
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

    this.onDependenciaCargosChange = new BehaviorSubject([]);
    this.onCentroOperativosChange = new BehaviorSubject([]);
    this.onCargosChange = new BehaviorSubject([]);
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

    if (this.urlFilters.hasOwnProperty('$filter')) {
      const dataFilters = {};
      const urlFilters = [];

      this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {

        if (decodeURIComponent(value) !== 'null') {
          switch (decodeURIComponent(key)) {
            case 'dependenciaId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`cargoDependenciaIndependiente/dependencia/id`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'cargoIndependienteId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`cargoDependenciaIndependiente/cargo/id`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'centroOperativoIndependienteId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`centroOperativoIndependienteId`)} eq ${decodeURIComponent(value)}`);
              break;
          }
        }
      });

      urlFilters.push(`${decodeURIComponent(`aplicacionExternaId`)} eq ${decodeURIComponent(this.id)}`);
      urlFilters.push(`${decodeURIComponent(`tipo`)} eq 'Revision'`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'cargoDependenciaIndependiente/dependencia/nombre asc';
    }
    return this._getRevisores(this.urlFilters);

  }  

  public getRevisores(): void{
    this._getRevisores(this.urlFilters);
  }

  private _getRevisores(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter= tipo eq 'Revision' and aplicacionExternaId eq ${this.id}`;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    // const paramsAdd = encodeURI(`$filter=tipo eq 'Aprobacion'`);
    const expand = encodeURI('$expand=centroOperativoDependiente,cargoDependenciaIndependiente($expand=cargo,dependencia),centroOperativoIndependiente');

    const url = `${environmentAlcanos.nomina}/odata/AplicacionExternaCargos?$count=true&${expand}&${filter}&${toUrlEncoded(params)}`;
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

  public getCentroOperativosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/CentroOperativos`)
        .subscribe((response: any) => {
          this.onCentroOperativosChange.next(response.value);
          resolve();
        }, reject);
    });
  }

  public getDependenciaCargosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/dependencias?$filter=estadoRegistro eq 'Activo'&$orderBy=nombre`)
        .subscribe((response: any) => {
          this.onDependenciaCargosChange.next(response.value);
          resolve();
        }, reject);
    });
  }

  public getCargosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/cargos?$select=id,nombre&$filter=estadoRegistro eq 'Activo'&$orderBy=nombre asc`)
        .subscribe((response: any) => {
          this.onCargosChange.next(response.value);
          resolve();
        }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.nomina}/api/AplicacionExternaCargos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
