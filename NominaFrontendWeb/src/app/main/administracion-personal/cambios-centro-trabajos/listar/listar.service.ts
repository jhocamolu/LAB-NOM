import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';

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

  constructor(
    private _httpClient: HttpClient
  ) {
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
            case 'funcionario':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`contrato/funcionario/criterioBusqueda`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'fechaInicio':
              if (decodeURIComponent(value) != 'null') {
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`fechaInicio eq ${moment(decodeURIComponent(value)).format('YYYY-MM-DD')}`);
              }
              break;
            default:
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
              break;
          }
        }
      });

      urlFilters.push(`${decodeURIComponent(`contrato/estado`)} eq '${decodeURIComponent(`Vigente`)}'`);

      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
  
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'criterioBusqueda asc') {
        this.urlFilters.$orderBy = 'contrato/funcionario/criterioBusqueda asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'criterioBusqueda desc') {
        this.urlFilters.$orderBy = 'contrato/funcionario/criterioBusqueda desc';
      }

      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'numeroDocumento asc') {
        this.urlFilters.$orderBy = 'contrato/funcionario/numeroDocumento asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'numeroDocumento desc') {
        this.urlFilters.$orderBy = 'contrato/funcionario/numeroDocumento desc';
      }

    } else {
      //this.urlFilters.$orderBy = 'contrato/funcionario/criterioBusqueda asc';
      this.urlFilters.$orderBy = 'fechaInicio desc';
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCentroTrabajos(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getCentroTrabajos(params: any): Promise<any> {
    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `&$filter=contrato/estado eq 'Vigente'`;
    }
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const element = `$expand=contrato($select=id,funcionarioId,estado;$expand=funcionario($select=primerNombre,primerApellido,numeroDocumento,criterioBusqueda)),centroTrabajoActual($select=id,codigo,nombre)`;
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ContratoCentroTrabajoCambios?${element}&$count=true${filter}&${toUrlEncoded(params)}`;
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
   * @returns {Promise<any>}
   */
  public getPeriodoContable(): Promise<any> {
    const params = encodeURI(`$select=id,fecha&$filter=estado eq 'Activo' and estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.novedades}/odata/PeriodoContables?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}+
   */

// 
  public getNominas(): Promise<any> {
    const params = `$select=id,fechaFinal,fechaInicio,estado&$filter=contains( tipoLiquidacion/nombre, 'Liquidación de PILA')&$expand=tipoLiquidacion($select=nombre)`;
    const url = `${environmentAlcanos.nomina}/odata/nominas?$count=true&${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


}
