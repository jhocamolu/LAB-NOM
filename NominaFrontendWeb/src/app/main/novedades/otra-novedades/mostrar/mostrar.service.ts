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
  items: any[];
  onItemsChanged: BehaviorSubject<any>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onItemsChanged = new BehaviorSubject({});

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
        this._getNovedad(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getNovedad(): void {
    this._getNovedad(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  private _getNovedad(id: number): Promise<any> {
    // tslint:disable-next-line: max-line-length
    const uriParam = encodeURI('$expand=funcionario($select=id,numeroDocumento,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda),categoriaNovedad($expand=conceptoNomina)');
    const url = `${environmentAlcanos.novedades}/odata/Novedades/${id}?${uriParam}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${url}`)
        .subscribe((response: any) => {
          this.items = response;
          this.onItemsChanged.next(this.items);
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTerceroAdministradorasSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/administradoras/${id}?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTerceroEntidadFinancierasSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/entidadFinancieras/${id}?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTerceroOtroTerceroSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/terceros/${id}?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  public estado(id: number, dato: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/novedades/${id}`, {
        id: id,
        estado: dato
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}

