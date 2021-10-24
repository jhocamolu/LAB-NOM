import { Injectable, ɵConsole } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any> {

  categoria: any;
  items: [];
  urlFilters: any;
  anio: any;
  todoAnnios: any; 
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */

  constructor(
    private _httpClient: HttpClient
  ) {
    this.categoria = {};
    this.items = [];
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
    let array: any;
    // Este codigo nos permite procesar anno queryParams dentro del objeto
    if (this.urlFilters.hasOwnProperty('$anno')) {
      this.urlFilters['$anno'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
        array = { val: value, key: key };
      });
      this.anio = array.val;
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getCategoria(route.params.categiriaId),
        this._getParametros(route.params.categiriaId, array),
        this._getAnio(this.anio)
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
  private _getCategoria(categoriaId: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/categoriaParametros/${categoriaId}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.categoria = response;
          resolve();
        }, reject);
    });
  }

  /**
   *
   * @returns {Promise<any>}
   */
  private _getAnio(annio: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/annoVigencias/${annio}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.todoAnnios = response;
          resolve();
        }, reject);
    });
  }


  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getParametros(categoriaId: number, anioVigente: any): Promise<any> {
    const params = encodeURI(
      `$filter=categoriaParametroId eq ${categoriaId} and annoVigenciaId eq ${anioVigente.val} and estadoRegistro eq 'Activo'&$orderBy=orden`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/parametroGenerales?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.items = response.value;
          resolve();
        }, reject);
    });
  }

  public getData(path: string): Promise<any> {
    path = path.replace('{administracionPersonal}', environmentAlcanos.administracionPersonal);
    path = path.replace('{ayuda}', environmentAlcanos.ayuda);
    path = path.replace('{configuracionGeneral}', environmentAlcanos.configuracionGeneral);
    path = path.replace('{gestorArchivos}', environmentAlcanos.gestorArchivos);
    path = path.replace('{nomina}', environmentAlcanos.nomina);
    path = path.replace('{plantillas}', environmentAlcanos.plantillas);
    // reparación de bug 1584 tomar en cuenta el enviroment
    path = path.replace('{{host}}', environmentAlcanos.configuracionGeneral);
    return new Promise((resolve, reject) => {
      this._httpClient.get(path)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

}
