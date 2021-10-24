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

  onDependenciasChanged: BehaviorSubject<any>;
  onCargosChanged: BehaviorSubject<any>;

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
    this.onDependenciasChanged = new BehaviorSubject({});
    this.onCargosChanged = new BehaviorSubject({});
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
        switch (decodeURIComponent(key)) {
          case 'funcionario':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`funcionario/criterioBusqueda`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
          case 'dependencia':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`dependenciaId`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          case 'cargo':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`cargoId`)} eq ${decodeURIComponent(value)}`);
            }
            break;
        }
      });
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }
    // Ordenar en primer nivel
    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
       this.urlFilters.$orderBy = 'funcionario/primerNombre asc';
    }
    return new Promise((resolve, reject) => {
      Promise.all([
        this._getProcesoCostos(this.urlFilters),
        this.getDependencias(),
        this.getCargos(),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getProcesoCostos(): void {
    this._getProcesoCostos(this.urlFilters);
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getProcesoCostos(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ActividadFuncionarioDatoActuales?$expand=funcionario&${toUrlEncoded(params)}&$count=true`;
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
  private getDependencias(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onDependenciasChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getCargos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCargosChanged.next(response.value);
        resolve();
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getDependenciasSolo(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCargosSolo(id: number): Promise<any> {
    const params = encodeURI(`$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/cargos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  public generarCostos(dato: any): Promise<any> {
    const confirmacion = {
      "confirmacion": dato
    }
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/FuncionarioCentroCostos`, confirmacion)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
