
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
    providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

    id: number | null;
    item: any | null;
    changed: any;


    // BehaviorSubject
    onItemChanged: BehaviorSubject<any>;
    onConceptoChanged: BehaviorSubject<any>;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the defaults
        this.onItemChanged = new BehaviorSubject(null);
        this.onConceptoChanged = new BehaviorSubject(null);
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
        this._getSolicitudCesantias(this.id)
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
      public _getSolicitudCesantias(id:number): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const url = `${environmentAlcanos.novedades}/odata/SolicitudCesantias/${id}?$expand=funcionario,motivoSolicitudCesantia`;
        return new Promise((resolve, reject) => {
          this._httpClient.get(url)
            .subscribe((response: any) => {
              this.onItemChanged.next(response);
              resolve(response);
            }, reject);
        });
      }
}