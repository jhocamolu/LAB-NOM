import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

  id: number;
  item: any;
  conceptos: any;
  //
  onItemChanged: BehaviorSubject<any>;
  onConceptosChanged: BehaviorSubject<any>;


  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onItemChanged = new BehaviorSubject({});
    this.onConceptosChanged = new BehaviorSubject({});

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
        this.getContratoAdministradoraCambios(this.id),
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
  private getContratoAdministradoraCambios(id: number): Promise<any> {
    const odataParams = encodeURI(`$select=id,anterior,actual,fechainicio,contrato&$expand=contrato($select=estado,estadoRegistro),funcionario($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,numeroDocumento,criterioBusqueda),tipoAdministradora($select=id,codigo,nombre)`)
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ContratoAdministradoraCambios/${id}?${odataParams}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.onItemChanged.next(response);
          resolve(response);
        }, reject);
    });
  }

}
