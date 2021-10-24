
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class RegistroService implements Resolve<any>{

  id: number | null;
  onGenerosChanged: BehaviorSubject<any[]>;
  onTipoDocumentosChanged: BehaviorSubject<any[]>;

  item: any | null;
  onItemChanged: BehaviorSubject<any>;
  changed: any;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.onGenerosChanged = new BehaviorSubject([]);
    this.onTipoDocumentosChanged = new BehaviorSubject([]);
    this.onItemChanged = new BehaviorSubject(null);
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
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [
      this.getGeneros(),
      this.getTipoDocumentos(),

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

  private getGeneros(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_Sexos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onGenerosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoDocumentos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.portal}/odata/Custom/_TipoDocumentos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoDocumentosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  public crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.portal}/api/autenticaciones/crear`, dato, { responseType: 'text' })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}