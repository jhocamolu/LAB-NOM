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
  onItemChanged: BehaviorSubject<any>;

  /**
   *
   * @param  {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onItemChanged = new BehaviorSubject({});
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
   * @param id // Obtiene datos del tipo de liquidaciones
   * @returns {Promise<any>}
   */
  public getAplicacion(id: number): Promise<any> {
    const url = `${environmentAlcanos.portal}/odata/Custom/_Candidatos-${id}?$expand=requisicionPersonal($expand=cargoDependenciaSolicitado($expand=cargo),divisionPoliticaNivel2,tipoContrato($select=nombre))`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  public eliminarAplicacion(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.delete(`${environmentAlcanos.portal}/reclutamiento/Candidatos/${dato.id}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
