import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any> {

  tab: number;
  id: number;

  totalSelecionados: BehaviorSubject<number>;

  item: any;
  onItemChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.onItemChanged = new BehaviorSubject({});
    this.tab = 0;

    this.totalSelecionados = new BehaviorSubject(0);

  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.id = route.params.id;
    this.tab = route.queryParams.tab ? route.queryParams.tab : 0;
    this.onItemChanged.next({});
    return new Promise((resolve, reject) => {
      Promise.all(
        [
          this._getRequisicionPersonales(this.id),
          this._getcandidatos(this.id),
        ]).then(() => {
          resolve();
        }, reject);
    });
  }


  public getRequisicionPersonales(): void {
    this._getRequisicionPersonales(this.id);
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getRequisicionPersonales(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargoDependenciaSolicitante($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitante($select=id,codigo,nombre,estadoRegistro), funcionarioSolicitante($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda) ,cargoDependenciaSolicitado($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitado($select=id,codigo,nombre,estadoRegistro), divisionPoliticaNivel2($select=id,codigo,nombre,estadoRegistro,divisionPoliticaNivel1Id; $expand=divisionPoliticaNivel1($select=id,codigo,nombre,estadoRegistro)), tipoContrato($select=id,nombre), centroCosto($select=id,nombre), motivoVacante ($select=id,codigo,nombre,requiereNombreAQuienReemplaza), funcionarioAQuienReemplaza($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda)`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/Requisicionpersonales/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }


  public getcandidatos(): void {
    this._getcandidatos(this.id);
  }

  private _getcandidatos(id: number): Promise<any> {

    const filter = `$filter=requisicionPersonalId eq ${id} and estado eq 'Seleccionado'`;
    const paramsAdd = encodeURI(`$select=id&$count=true`);
    const url = `${environmentAlcanos.nomina}/odata/Candidatos?${paramsAdd}&${filter}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalSelecionados.next(response['@odata.count']);
          resolve();
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public estado(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/Requisicionpersonales/${id}/estado`, {
        id: id,
        estado: dato
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
