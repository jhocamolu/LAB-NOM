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
            case 'fechaInicio':
              if (decodeURIComponent(value) != 'null') {
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`fechaCreacion ge ${moment(decodeURIComponent(value)).format('YYYY-MM-DD')}`);
              }
              break;
            case 'fechaFin':
              if (decodeURIComponent(value) != 'null') {
                dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                urlFilters.push(`fechaCreacion le ${moment(decodeURIComponent(value)).format('YYYY-MM-DD')}`);
              }
              break;
            case 'funcionario':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionarioSolicitante/criterioBusqueda`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'cargoSolicitado':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`cargoDependenciaSolicitado/cargo/nombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'cargoSolicitante':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`cargoDependenciaSolicitante/cargo/nombre`)}, '${decodeURIComponent(value)}')`);
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
      this.urlFilters.$orderBy = 'funcionarioSolicitante/primerNombre asc';
    }

    if (activeFilter) {
      this.urlFilters.$filter = `${this.urlFilters['$filter']} and estadoRegistro eq 'Activo'`;
    } else {
      this.urlFilters.$filter = "estadoRegistro eq 'Activo'";
    }


    return new Promise((resolve, reject) => {
      Promise.all([
        this.getRequisicionPersonales(this.urlFilters)
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

  public getRequisicionPersonales(params: any): Promise<any> {
    const onlyParams = encodeURI(`$expand=cargoDependenciaSolicitante($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitante($select=id,codigo,nombre,estadoRegistro), funcionarioSolicitante($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda) ,cargoDependenciaSolicitado($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitado($select=id,codigo,nombre,estadoRegistro), divisionPoliticaNivel2($select=id,codigo,nombre,estadoRegistro,divisionPoliticaNivel1Id; $expand=divisionPoliticaNivel1($select=id,codigo,nombre,estadoRegistro)), tipoContrato($select=id,nombre), centroCosto($select=id,nombre), motivoVacante ($select=id,codigo,nombre,requiereNombreAQuienReemplaza), funcionarioAQuienReemplaza($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda)`);
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/Requisicionpersonales/?${onlyParams}&$count=true&${toUrlEncoded(params)}`;
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
   * @filtro string
   * @returns {Promise<any>}
   */
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=primerNombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * @id number
   * @returns {Promise<any>}
   */
  public getContratosFilter(id: number): Promise<any> {
    const params = encodeURI(`$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/?$count=true&${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }



  /**
   * 
   * @param value // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getSoloCargos(filtro: number): Promise<any> {
    const filterNombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,nombre`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

}
