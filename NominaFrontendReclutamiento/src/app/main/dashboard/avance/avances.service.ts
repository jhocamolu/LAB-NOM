
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class AvanceService implements Resolve<any>{

  id: number | null;
  onItemChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

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
    this.dataRequest = new BehaviorSubject(false);
    }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = null;
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [

    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      // promises.push(this._getContrato(this.id));
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
   * @returns {Promise<any>}
   */

  public getAvances(id): Promise<any> {
    const url = `${environmentAlcanos.portal}/odata/Custom/DashboardPortal/${id}`;
    return new Promise((resolve, reject) => {
      this.dataRequest.next(true);
      this._httpClient.get(url).subscribe((response: any) => {
        this.onItemChanged.next(response.value);
        this.dataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }
}