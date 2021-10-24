import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
  providedIn: 'root'
})
export class AsignacionService {

  item: any;
  onItemChange: BehaviorSubject<any>;
  //
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  onAsignacionChange: BehaviorSubject<any[]>;
  dataRequest: BehaviorSubject<boolean>;
  estateRefresh: BehaviorSubject<any[]>
  // filtros modal
  centroOperativos: any[];
  dependencias: any[];
  grupoNominas: any[];

  //
  nominaFuncionarios: any[];
  onNominaFuncionariosChange: BehaviorSubject<any[]>;
  action: string | null;



  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChange = new BehaviorSubject(null);
    //
    this.totalCount = 0;
    this.dataFilters = {};
    this.dataRequest = new BehaviorSubject(false);
    this.onAsignacionChange = new BehaviorSubject([]);
    this.estateRefresh = new BehaviorSubject([]);
    //
    this.nominaFuncionarios = [];
    this.onNominaFuncionariosChange = new BehaviorSubject([]);
    this.action = null;
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
    this.action = route.queryParams.action;
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
            case 'centroOperativoId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`centroOperativoId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'dependenciaId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`dependenciaId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'grupoNominaId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`grupoNominaId`)} eq ${decodeURIComponent(value)}`);
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

    const promises = [
      this._getCentroOperativos(),
      this._getDependencias(),
      this._getGrupoNomina(),
      this._getNomina(route.params.id),
      this._getAsignados(route.params.id, this.urlFilters),
      this.getIdNomina(route.params.id)
    ];
    this.item = null;
    this.onItemChange.next(null);
    this.onAsignacionChange.next([]);
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });


  }

  public refreshData(id: number): void {
    this.getIdNomina(id);
    this._getNomina(id);
    this._getAsignados(id, this.urlFilters);
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
          this.onItemChange.next(this.item);
          resolve();
        }, reject);
    });
  }


  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getIdNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
        .subscribe((response: any) => {
          this.estateRefresh.next(response);
          resolve(response);
        }, reject);
    });
  }



  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getAsignados(id: number, params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this.dataRequest.next(true);
    const url = `${environmentAlcanos.nomina}/odata/GetNominaFuncionarioDatoActuales(NominaId=${id})?$count=true&${toUrlEncoded(params)}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.onAsignacionChange.next(response.value);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }



  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public limpiarnomina(id: number): Promise<any> {
    const url = `${environmentAlcanos.nomina}/api/nominafuncionarios/limpiarnomina/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @param funcionarioIds 
   * 
   * @returns {Promise<any>}
   */
  public eliminarAsignado(id: number, funcionarioIds: number[]): Promise<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        id: id,
        funcionarios: funcionarioIds
      },
    };
    const url = `${environmentAlcanos.nomina}/api/nominafuncionarios/eliminarfuncionarios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url, options)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * filtro de funcionarios para nominas
   *    
   * @param datos
   * @returns {Promise<any>}
   */
  public getNominaFuncionarios(datos: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/nominafuncionarios/listar`, datos)
        .subscribe((response: any) => {
          this.nominaFuncionarios = response;
          this.onNominaFuncionariosChange.next(response);
          resolve();
        }, reject);
    });
  }


  /**
   * Filtro funcionario
   * 
   * @param filtro 
   * @returns {Promise<any>}
   */
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=criterioBusqueda`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'and estado ne 'Seleccionado'`;
    const select = `$select=id,criterioBusqueda,estado`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.nomina}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * filtro centro operativo
   * 
   * @returns {Promise<any>}
   */
  private _getCentroOperativos(): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo'&$orderby=nombre`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/centroOperativos?${params}`)
        .subscribe((response: any) => {
          this.centroOperativos = response.value;
          resolve();
        }, reject);
    });
  }

  /**
   * filtro dependencia
   * 
   * @returns {Promise<any>}
   */
  private _getDependencias(): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo'&$orderby=nombre`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/dependencias?${params}`)
        .subscribe((response: any) => {
          this.dependencias = response.value;
          resolve();
        }, reject);
    });
  }

  /**
   * filtro cargos por dependencias
   * 
   * @param dependenciaId 
   * @returns {Promise<any>}
   */
  public getCargoDependencias(dependenciaId: number): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo' and dependenciaId eq ${dependenciaId}&$expand=cargo&$orderby=nombre`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/cargoDependencias?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


  /**
   * filtro grupo de nomina 
   * 
   * @returns {Promise<any>}
   */
  private _getGrupoNomina(): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo'&$orderby=nombre`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/grupoNominas?${params}`)
        .subscribe((response: any) => {
          this.grupoNominas = response.value;
          resolve();
        }, reject);
    });
  }


  /**
   *    
   * @param datos
   * @returns {Promise<any>}
   */
  public asignar(datos: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/nominafuncionarios`, datos)
        .subscribe((response: any) => {
          this.nominaFuncionarios = response;
          this.onNominaFuncionariosChange.next(response);
          resolve();
        }, reject);
    });
  }


}
