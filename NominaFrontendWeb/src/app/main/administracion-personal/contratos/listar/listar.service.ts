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
  filtroValidado: boolean;

  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

  estados: any[];
  onTipoDocumentosChange: BehaviorSubject<any[]>;
  onTipoContratosChange: BehaviorSubject<any[]>;

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

    this.onTipoDocumentosChange = new BehaviorSubject([]);
    this.onTipoContratosChange = new BehaviorSubject([]);


    this.estados = [
      {
        id: '0',
        nombre: 'Vigente',
      },
      {
        id: '1',
        nombre: 'Sin iniciar',
      },
      {
        id: '2',
        nombre: 'Terminado',
      },

    ];
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

    let activeFilter: any = false;

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
          activeFilter = true;

          switch (decodeURIComponent(key)) {
            case 'tipoContrato':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`tipoContratoId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'criterioBusqueda':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionario/criterioBusqueda`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'tipoDocumento':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`funcionario/tipoDocumentoId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'numeroContrato':
              if (decodeURIComponent(value).includes('-')) {
                urlFilters.push(`contains(${decodeURIComponent(`numeroContrato`)}, '${decodeURIComponent(value)}')`);
              } else {
                urlFilters.push(`contains(${decodeURIComponent(`funcionario/numeroDocumento`)}, '${decodeURIComponent(value)}')`);
              }
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              break;
            case 'estado':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
              break;
            default:
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
              break;
          }
        }
      });
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
    }


    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'fechaInicio desc';
    }

    if (activeFilter) {
      this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo' and funcionario/estadoRegistro eq 'Activo'`;
    } else {
      this.urlFilters.$filter = "estadoRegistro eq 'Activo' and funcionario/estadoRegistro eq 'Activo'";
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this.getContratos(this.urlFilters)
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
  public getContratos(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/Contratos/?$expand=funcionario,tipoContrato&$count=true&${toUrlEncoded(params)}`;
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

  public getTipoDocumentosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/tipoDocumentos`)
        .subscribe((response: any) => {
          this.onTipoDocumentosChange.next(response.value);
          resolve();
        }, reject);
    });
  }

  public getTipoContratosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/tipoContratos`)
        .subscribe((response: any) => {
          this.onTipoContratosChange.next(response.value);
          resolve();
        }, reject);
    });
  }


}
