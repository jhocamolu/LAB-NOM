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
        if (decodeURIComponent(value) !== 'null') {
          if (decodeURIComponent(value) !== 'null') {
            switch (decodeURIComponent(key)) {
              case 'funcionario':
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
                break;
              case 'tipoAdministradora':
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`${decodeURIComponent(`tipoAdministradoraId`)} eq ${decodeURIComponent(value)}`);
                break;
              default:
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                break;
            }
          }
        }
      });
      this.dataFilters = dataFilters;
      // se incluyen estado y estado registro de manera forzada
      urlFilters.push(`${decodeURIComponent(`contrato/estado`)} eq '${decodeURIComponent('Vigente')}'`);
      urlFilters.push(`${decodeURIComponent(`contrato/estadoRegistro`)} eq '${decodeURIComponent('Activo')}'`);
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'fechaInicio desc';
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getContratoAdministradoraCambios(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getContratoAdministradoraCambios(): void {
    this._getContratoAdministradoraCambios(this.urlFilters);
  }
  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getContratoAdministradoraCambios(params: any): Promise<any> {
    // se incluyen estado y estado registro de manera forzada
    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=contrato/estado eq 'Vigente' and contrato/estadoRegistro eq 'Activo'`;
    }
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const odataParams = encodeURI(`$select=id,anterior,actual,fechainicio,contrato,contratoId,observacion&$expand=contrato($select=estado,estadoRegistro),funcionario($select=id,primerNombre,segundoNombre,segundoApellido,primerApellido,numeroDocumento,criterioBusqueda),tipoAdministradora($select=id,codigo,nombre)&$count=true`)
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ContratoAdministradoraCambios?${filter}&${odataParams}&${toUrlEncoded(params)}`;
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
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/ContratoAdministradoraCambios/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
