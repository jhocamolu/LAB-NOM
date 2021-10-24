import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class InformacionBasicaService {

  onItemChanged: BehaviorSubject<any>;
  onPeriodoChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient,
    private _alcanosSnackBar: AlcanosSnackBarService
  ) {
    this.onItemChanged = new BehaviorSubject(null);
    this.onPeriodoChanged = new BehaviorSubject(null);
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const promises = [];
    this.onItemChanged.next(null);
    if (route.params.id) {
      promises.push(this._getNomina(route.params.id));
    }
    promises.push(this._getPeriodoContable());
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    }).catch(resp => {
      this._alcanosSnackBar.snackbar({
        mensaje: resp.status === 404 ? resp.error.message : null,
        clase: 'error',
        time: 5000
      });
    });
  }

  private _getNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/api/nominas/NominaCabecera/${id}?`)
        .subscribe((response: any) => {
          this.onItemChanged.next(response);
          resolve();
        }, reject);
    });
  }

  private _getPeriodoContable(): Promise<any> {
    const url = `${environmentAlcanos.nomina}/api/nominas/periodoContableActivo`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.onPeriodoChanged.next(response);
          resolve();
        }, reject);
    });
  }

  /**
   * @param id 
   * @returns {Promise<any>}
   */
  public getIdNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  upsert(dato: any): Promise<any> {
    if ('id' in dato && dato.id) {
      return this._editar(dato.id, dato);
    }
    return this._crear(dato);
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  private _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/nominas`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  private _editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/nominas/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  getTipoLiquidaciones(): Promise<any> {
    const params = encodeURI(
      `$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tipoLiquidaciones?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  getSubperiodos(tipoPeriodoId: number): Promise<any> {
    const params = encodeURI(
      `orderby=nombre asc&$filter=tipoPeriodoId eq ${tipoPeriodoId} and estadoRegistro eq 'Activo'`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/subperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}
