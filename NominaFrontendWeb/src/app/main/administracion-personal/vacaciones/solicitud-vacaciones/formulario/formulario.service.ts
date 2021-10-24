import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  id: any | null;

  item: any | null;
  onItemChanged: BehaviorSubject<any>;
  
  selectedTab: number;

  
  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
   
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

    this.id = route.params.id;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);

    if (route.queryParams.tab != null) {
      this.selectedTab = route.queryParams.tab;
    } else {
      this.selectedTab = 0;
    }

    const promises = [
    ];
    if (this.id != null) {
      promises.push(this._getSolicitudVacaciones(this.id));
    }
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
   *
   * @returns {Promise<any>}
   */
  private _getSolicitudVacaciones(id: number): Promise<any> {
    const expand = '$expand=funcionario,libroVacaciones';
    const url = `${environmentAlcanos.nomina}/odata/SolicitudVacaciones/${id}?${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChanged.next(this.item);
          resolve();
        }, reject);
    });
  }


  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getLibroVacaciones(funcionarioId: number): Promise<any> {
    const expand = encodeURI('$expand=contrato');
    const filter = encodeURI(`$filter=contrato/funcionarioId eq ${funcionarioId} and contrato/estado eq 'Vigente' and (diasDisponibles gt 0 or diasDebe gt 0)`);
    const url = `${environmentAlcanos.novedades}/odata/LibroVacaciones?${expand}&${filter}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


  public _getInterrupciones(): any {
    return this.getInterrupciones(this.id);
  }

  /**
   * @returns {Promise<any>}
   */
  public getInterrupciones(id: number): Promise<any> {
    const params = encodeURI(`$expand=AusentismoFuncionario($expand=tipoAusentismo($expand=claseAusentismo))&$filter=solicitudVacacionesId eq ${id}&$count=true`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/SolicitudVacacionesInterrupciones?${params}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item != null && this.id != null) {
      return this.editar(this.id, dato);
    }
    return this.crear(dato);
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/SolicitudVacaciones/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/SolicitudVacaciones`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=criterioBusqueda`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.nomina}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }



}
