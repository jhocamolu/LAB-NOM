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
  rango: any[];
  onRangoChanged: BehaviorSubject<any>;


  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onRangoChanged = new BehaviorSubject({});
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
        this.getRango(this.id),
        // this._getCargosReportas(this.id),
        // this._getCargosGrados(this.id),
        // this._getCargoDependencias(this.id),
        // this._getCargoGrupos(this.id),
        // this._getCargoPresupuestos(this.id)
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
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  private getRango(id: number): Promise<any> {
    // const params = encodeURI('$expand=nivelcargo');
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/RangoUvts/${id}?`)
        .subscribe((response: any) => {
          this.rango = response;
          this.onRangoChanged.next(this.rango);
          resolve(response);
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
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/RangoUvts/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
