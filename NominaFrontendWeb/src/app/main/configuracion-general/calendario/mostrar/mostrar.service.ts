import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

  id: number;
  events: any;
  onEventsUpdated: Subject<any>;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onEventsUpdated = new Subject();
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getEvents()
      ]).then(
        ([events]: [any]) => {
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

  getEvents(): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/calendarios`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.events = response.value;
          this.onEventsUpdated.next(this.events);
          resolve(this.events);

        }, reject);
    });
  }

  /**
   * 
   * @param id 
   */
  deleteEvent(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/calendarios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
