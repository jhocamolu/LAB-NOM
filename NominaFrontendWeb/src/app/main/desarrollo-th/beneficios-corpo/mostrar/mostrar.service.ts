import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

  id: number;
  item: any;
  onItemChanged: BehaviorSubject<any>;


  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onItemChanged = new BehaviorSubject({});
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
        this._getBeneficios(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }


  public getBeneficios(): void {
    this._getBeneficios(this.id); 
  }
  /**
   * 
   * @param id // Obtiene datos del tipo de liquidaciones
   * @returns {Promise<any>}
   */
  private _getBeneficios(id: number): Promise<any> {
    const params = encodeURI(`$expand=tipobeneficio,funcionario,tipoPeriodo`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/beneficios/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }

  /**
  * 
  * @param id 
  * @returns {Promise<any>}
  */
  public getBeneficioSubperiodos(id: number): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/BeneficioSubperiodos/?$expand=subperiodo&$filter=beneficioId eq ${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
  * 
  * @param id 
  * @returns {Promise<any>}
  */
  public getBeneficioAdjuntos(id: number): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/BeneficioAdjuntos?$filter=beneficioId eq ${id}&$expand=tipoBeneficioRequisito($expand=tipoSoporte)`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getTipoBeneficios(id: number): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/tipobeneficios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }


  /**
 * @param dato 
 * @param observacionAprobacion
 * @param observacionAutorizacion
 * @returns {Promise<any>}
 * Cambio de editar a crear según requerimiento
 */

  public upsert(dato: any): Promise<any> {
    if (dato !== null) {
      if (dato.tipo === 'aprobar') {
        return this._aprobar(dato);
      }
      if (dato.tipo === 'autorizar') {
        return this._autorizar(dato);
      }
    }
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  private _aprobar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/beneficios/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  private _autorizar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/beneficios/${dato.id}`, dato)
        .subscribe((response: any) => {
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
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/beneficios/estado/${id}`, {
        id: id,
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



}
