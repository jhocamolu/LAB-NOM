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
  TareaProgramadas: any[];
  onTareaProgramadasChanged: BehaviorSubject<any>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onTareaProgramadasChanged = new BehaviorSubject({});
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
        this._getTareaProgramadas(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getTareaProgramadas(): void {
    this._getTareaProgramadas(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del tipo liquidaciones
   * @returns {Promise<any>}
   */
  private _getTareaProgramadas(id: number): Promise<any> {
    
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/TareaProgramadas/${id}?`)
        .subscribe((response: any) => {
          this.TareaProgramadas = response;
          this.onTareaProgramadasChanged.next(this.TareaProgramadas);
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/TareaProgramadas/${dato.alias}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
