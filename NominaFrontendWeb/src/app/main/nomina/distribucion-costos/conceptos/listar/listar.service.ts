import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { paisAlcanos } from '@alcanos/constantes/paises';


@Injectable({
  providedIn: 'root'
})
export class ConceptosListarService {

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

        if (decodeURIComponent(value) !== 'null') {
          switch (decodeURIComponent(key)) {
            case 'centroCostoId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`centroCosto/nombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'municipioId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`municipioId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'departamentoOrigenId':
              if (decodeURIComponent(value) != "undefined") {
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`${decodeURIComponent(`municipio/divisionPoliticaNivel1Id`)} eq ${decodeURIComponent(value)}`);
              }
              break;
          }
        }
      });

      urlFilters.push(`${decodeURIComponent(`actividadId`)} eq ${decodeURIComponent(this.id)}`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'centroCosto/nombre asc';
    }
    return this._getCuentaDebitos(this.urlFilters);
  }

  private _getCuentaDebitos(params: any): Promise<any> {

    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=actividadId eq ${this.id}`;
    }

    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const paramsAdd = encodeURI(`$select=id,actividadId,centroCostoId,municipioId,estadoRegistro&$expand=actividad($select=id,nombre,codigo,estadoRegistro),centroCosto($select=id,nombre,codigo,estadoRegistro),municipio($expand=divisionPoliticaNivel1)&$count=true`);
    const url = `${environmentAlcanos.nomina}/odata/ActividadCentroCostos?${paramsAdd}&${filter}&${toUrlEncoded(params)}`;
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


  public getCentroCostosFiltro(filtro: string): Promise<any> {
    const filterCodigo = `contains(codigo,'${filtro}')`;
    const filterNombre = `contains(nombre,'${filtro}')`;
    const orderby = `$orderby=nombre`;
    const filter = `$filter=(${filterNombre} or ${filterCodigo})&$select=id,nombre,codigo,estadoRegistro`;
    const params = encodeURI(`${orderby}&${filter}`);
    const url = `${environmentAlcanos.nomina}/odata/centrocostos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$top=1&$filter=estadoRegistro eq 'Activo' and codigo eq '${paisAlcanos.colombia}'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/paises?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param paisId 
   * @returns {Promise<any>}
   */
  public getDepartamentos(paisId: number): Promise<any> {
    const params = encodeURI(`$filter=paisId eq ${paisId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles1?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param departamentoId 
   * @returns {Promise<any>}
   */
  public getMunicipios(departamentoId: number): Promise<any> {
    const params = encodeURI(`$filter=divisionPoliticaNivel1Id eq ${departamentoId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/ActividadCentroCostos/${id}`, {
        id: id,
        activo: activo,
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



}



