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
  tipoAusentismos: any[];
  onTipoAusentismosChanged: BehaviorSubject<any>;

  selectedTab: number;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onTipoAusentismosChanged = new BehaviorSubject({});
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
        this._getTipoAusentismo(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getTipoAusentismo(): void {
    this._getTipoAusentismo(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del tipo liquidaciones
   * @returns {Promise<any>}
   */
  private _getTipoAusentismo(id: number): Promise<any> {
    const params = encodeURI('$expand=claseAusentismo');
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoAusentismos/${id}?${params}`)
        .subscribe((response: any) => {
          this.tipoAusentismos = response;
          this.onTipoAusentismosChanged.next(this.tipoAusentismos);
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
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/tipoAusentismos/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getClaseLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/ClaseAusentismos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


}
