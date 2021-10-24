import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EditarService implements Resolve<any> {

  id: number;
  tipoPeriodos: any[];
  onTipoPeriodosChanged: BehaviorSubject<any>;

  selectedTab: number;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onTipoPeriodosChanged = new BehaviorSubject({});
    this.selectedTab = 0;
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
    if (route.queryParams.tab != null) {
      this.selectedTab = route.queryParams.tab;
    } else {
      this.selectedTab = 0;
    }
    return new Promise((resolve, reject) => {
      Promise.all([
        this._getTipoperiodo(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }



  public getTipoPeriodo(): void {
    this._getTipoperiodo(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del tipo liquidaciones
   * @returns {Promise<any>}
   */
  private _getTipoperiodo(id: number): Promise<any> {
    // const params = encodeURI('$expand=claseAusentismo');
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/TipoPeriodos/${id}`)
        .subscribe((response: any) => {
          this.tipoPeriodos = response;
          this.onTipoPeriodosChanged.next(this.tipoPeriodos);
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/TipoPeriodos/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  borrar(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/SubPeriodos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}















