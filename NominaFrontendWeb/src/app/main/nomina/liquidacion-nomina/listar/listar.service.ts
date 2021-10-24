import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ListarService implements Resolve<any> {

  totalCount: number;
  urlFilters: any;
  page: number;

  onItemsChanged: BehaviorSubject<any[]>;
  onPeriodoChanged: BehaviorSubject<any>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    // Set the defaults
    this.totalCount = 0;
    this.onItemsChanged = new BehaviorSubject([]);
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
    this.urlFilters = JSON.parse(JSON.stringify(route.queryParams));
    if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy = 'fechaInicio desc';
    }

    this.urlFilters.$filter = `estadoRegistro eq 'Activo'`;

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getNomina(this.urlFilters),
        this._getPeriodoContable()
      ]).then(
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


  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getNomina(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.nomina}/odata/nominas?$count=true&$expand=tipoLiquidacion($expand=tipoPeriodo)&${toUrlEncoded(params)}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.onItemsChanged.next(response.value);
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


  getTipoPeriodoLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }




}
