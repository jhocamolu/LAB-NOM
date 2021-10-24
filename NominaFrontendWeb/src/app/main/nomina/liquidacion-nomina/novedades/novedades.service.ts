import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class NovedadesService {

  id: number | null;
  item: any;
  items: any[];
  //
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  onNovedadesChange: BehaviorSubject<any[]>;
  dataRequest: BehaviorSubject<boolean>;

  fuenteNovedades: any[];

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    //
    this.totalCount = 0;
    this.dataFilters = {};
    this.dataRequest = new BehaviorSubject(false);
    this.onNovedadesChange = new BehaviorSubject([]);

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
            case 'numeroDocumento':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`nominaFuncionario/funcionario/numeroDocumento`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'primerNombre':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`nominaFuncionario/funcionario/primerNombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'primerApellido':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`nominaFuncionario/funcionario/primerApellido`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'fuenteNovedadesId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`conceptoNomina/id`)} eq ${decodeURIComponent(value)}`);
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

    // ordenar asc y desc en segundo nivel //
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
      if (this.urlFilters.$orderBy === 'primerNombre asc') {
        this.urlFilters.$orderBy = 'nominaFuncionario/funcionario/primerNombre asc';
      }
      if (this.urlFilters.$orderBy === 'primerNombre desc') {
        this.urlFilters.$orderBy = 'nominaFuncionario/funcionario/primerNombre desc';
      }

    }

    const promises = [
      this._getFuenteNovedades(),
      this._getNomina(route.params.id),
      this.getNovedades(route.params.id),
    ];
    this.item = null;
    this.onNovedadesChange.next([]);
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });


  }


  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/api/nominas/NominaCabecera/${id}?`)
        .subscribe((response: any) => {
          this.item = response;
          resolve();
        }, reject);
    });
  }

  /**
   * @param id 
   * @returns {Promise<any>}
   */
  public getIdNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  public getNovedades(id: number): Promise<any> {
    if (this.urlFilters.hasOwnProperty('$filter') && this.urlFilters.$filter !== true) {
      this.urlFilters.$filter += ` and nominafuncionario/nominaid eq ${id} and conceptoNomina/tipoConceptoNomina eq 'Novedad'`;
    } else {
      this.urlFilters.$filter = `nominafuncionario/nominaid eq ${id} and conceptoNomina/tipoConceptoNomina eq 'Novedad'`;
    }
    return this._getNovedades(id, this.urlFilters);
    // &$filter=nominafuncionario/nominaid eq ${id}
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getNovedades(id: number, params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this.dataRequest.next(true);
    const expand = encodeURI(`$expand=conceptoNomina,nominaFuncionario($expand=funcionario),nominaFuenteNovedad&$count=true`);
    const url = `${environmentAlcanos.nomina}/odata/NominaDetalles/?${expand}&${toUrlEncoded(params)}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          this.onNovedadesChange.next(response.value);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }



  private _getFuenteNovedades(): Promise<any> {
    const params = encodeURI(`$filter=tipoConceptoNomina eq 'Novedad'&$orderby=nombre&$select=id,nombre`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptoNominas?${params}`)
        .subscribe((response: any) => {
          this.fuenteNovedades = response.value;
          resolve();
        }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.nomina}/api/NominaDetalles/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



}
