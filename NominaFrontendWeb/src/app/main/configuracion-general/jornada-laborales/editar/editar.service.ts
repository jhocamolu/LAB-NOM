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
  item: any[];
  onJornadaLaboralChanged: BehaviorSubject<any>;

  selectedTab: number;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(private _httpClient: HttpClient) {
    this.onJornadaLaboralChanged = new BehaviorSubject({});
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
        this._getJornadaLaborales(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getJornadaLaborales(): Promise<any> {
    return this._getJornadaLaborales(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  private _getJornadaLaborales(id: number): Promise<any> {
    const params = encodeURI('$expand=jornadaLaboralDias($count=true)');
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/jornadalaborales/${id}?${params}`)
        .subscribe((response: any) => {
          this.item = response;
          this.onJornadaLaboralChanged.next(this.item);
          resolve();
        }, reject);
    });
  }

  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/JornadaLaborales/${id}`,
        dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

 

}
