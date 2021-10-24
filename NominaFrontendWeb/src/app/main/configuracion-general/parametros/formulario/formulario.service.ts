import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  categoriaId: number;
  items: [];
  urlFilters: any;
  annoVigencia: number;
  todoAnnios: any; 
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */

  constructor(
    private _httpClient: HttpClient
  ) {
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
        array = value;
      });
    }
    this.annoVigencia = array;

    this.categoriaId = route.params.categiriaId;
    return new Promise((resolve, reject) => {
      Promise.all([
        this._getParametros(route.params.categiriaId, array),
        this._getAnio(this.annoVigencia)
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
  private _getParametros(categoriaId: number, anioVigente: any): Promise<any> {

    const params = encodeURI(
      `$filter=categoriaParametroId eq ${categoriaId} and annoVigenciaId eq ${anioVigente} and estadoRegistro eq 'Activo'&$orderBy=orden`
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

  public getData(path: string): Promise<any> {
    path = path.replace('{administracionPersonal}', environmentAlcanos.administracionPersonal);
    path = path.replace('{ayuda}', environmentAlcanos.ayuda);
    path = path.replace('{configuracionGeneral}', environmentAlcanos.configuracionGeneral);
    path = path.replace('{gestorArchivos}', environmentAlcanos.gestorArchivos);
    path = path.replace('{nomina}', environmentAlcanos.nomina);
    path = path.replace('{plantillas}', environmentAlcanos.plantillas);
    return new Promise((resolve, reject) => {
      this._httpClient.get(path)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }



  public upsert(valores: any[]): Promise<any> {
    const datos = { valores: valores };
    const url = `${environmentAlcanos.configuracionGeneral}/api/parametroGenerales`;
    return new Promise((resolve, reject) => {
      this._httpClient.patch(url, datos)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



}
