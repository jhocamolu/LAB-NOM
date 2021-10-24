import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any> {

  id: number;
  item: any;
  interrupciones: any;
  totalCount: number;
  onItemChanged: BehaviorSubject<any>;
  onInterrupcionesChanged: BehaviorSubject<any>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    //
    this.totalCount = 0;
    this.onItemChanged = new BehaviorSubject({});
    this.onInterrupcionesChanged = new BehaviorSubject({});

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

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getSolicitudVacaciones(this.id),
        this.getInterrupciones(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public _getSolicitudVacaciones() {
    this.getSolicitudVacaciones(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del tipo de liquidaciones
   * @returns {Promise<any>}
   */
  private getSolicitudVacaciones(id: number): Promise<any> {
    const params = encodeURI('$expand=funcionario($select=id,criterioBusqueda,numeroDocumento),libroVacaciones');
    const url = `${environmentAlcanos.configuracionGeneral}/odata/SolicitudVacaciones/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
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

}
