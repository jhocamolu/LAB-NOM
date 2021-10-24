import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
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

  // datos para filtros
  onGrupoDocumentosChanged: BehaviorSubject<any>;

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

    this.onGrupoDocumentosChanged = new BehaviorSubject([]);
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
          switch (decodeURIComponent(key)) {

            case 'criterioBusqueda':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionario/criterioBusqueda`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'grupoDocumentoSlug':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`grupoDocumentoSlug`)}, 'Edm.String'), '${decodeURIComponent(value)}')`);
              break;

            case 'fechaInicio':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaInicio ge ${decodeURIComponent(value)}`);
              break;

            case 'fechaFin':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaFin le ${decodeURIComponent(value)}`);
              break;

            // case 'fechaFin':
            //   dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
            //   urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
            //   break;

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
      this.urlFilters.$orderBy = 'funcionario/primerNombre Asc';
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this.getGrupoDocumentosList(),
        this._getRepresentanteEmpresas(this.urlFilters)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getRepresentanteEmpresas(): void {
    this._getRepresentanteEmpresas(this.urlFilters);
  }
  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getRepresentanteEmpresas(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    // tslint:disable-next-line: max-line-length
    const url = `${environmentAlcanos.nomina}/odata/representanteempresas?$expand=funcionario($select=id,criterioBusqueda,estado,numeroDocumento,primerNombre,segundoNombre,primerApellido,segundoApellido)&$count=true&${toUrlEncoded(params)}`;
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
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/representanteempresas/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getGrupoDocumentosList(): Promise<any> {
    const params = encodeURI(
      `$orderby=nombre&$filter=estadoRegistro eq 'Activo'`
    );
    const url = `${environmentAlcanos.plantillas}/odata/grupodocumentos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onGrupoDocumentosChanged.next(response.value);
        resolve();
      }, reject);
    });
  }
}
