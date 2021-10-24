import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable()
export class PrincipalService implements Resolve<any>
{   
    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;
    projects: any[];
    widgets: any[];

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    )
    {
        this.onItemsChanged = new BehaviorSubject({});
        this.dataRequest = new BehaviorSubject(false);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getDashboard(),
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getDashboard(): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const url = `${environmentAlcanos.configuracionGeneral}/api/dashboards/GraficasWeb/`;
        this.dataRequest.next(true);
        return new Promise((resolve, reject) => {
          this._httpClient.post(url,{
            "aplicacion": "GHESTIC"
          })
            .subscribe((response: any) => {
              this.items = response;
              this.onItemsChanged.next(this.items);
              this.dataRequest.next(false);
              resolve(response);
            }, reject);
        });
      }
}
