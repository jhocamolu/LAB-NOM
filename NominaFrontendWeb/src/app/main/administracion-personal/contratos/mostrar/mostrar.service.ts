import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any> {

  tab: number;
  id: number;

  item: any;
  onItemChanged: BehaviorSubject<any>;
  onOtrosiChanged: BehaviorSubject<any[]>;
  otrosiDataRequest: BehaviorSubject<boolean>;
  onCentroTrabajoChanged: BehaviorSubject<any[]>;

  constructor(private _httpClient: HttpClient) {

    this.onItemChanged = new BehaviorSubject({});
    this.onOtrosiChanged = new BehaviorSubject([]);
    this.onCentroTrabajoChanged = new BehaviorSubject([]);

    this.otrosiDataRequest = new BehaviorSubject(true);
    this.tab = 0;
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
    this.onOtrosiChanged.next([]);
    this.otrosiDataRequest.next(true);
    return new Promise((resolve, reject) => {
      Promise.all(
        [
          this.getContratos(this.id),
          this._getOtrosi(this.id),
          this.getContratoCentroTrabajo(this.id)
        ]).then(() => {
          resolve();
        }, reject);
    });
  }


  public _getContratos(): void {
    this.getContratos(this.id);

  }


  /**
   *
   *
   * @returns {Promise<any>}
   */
  public getContratos(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=tipoContrato,cargodependencia($expand=dependencia,cargo),CargoGrupo($expand=grupo),gruponomina,funcionario($expand=tipoDocumento),divisionPoliticaNivel2($expand=divisionPoliticaNivel1),centroOperativo,centroCosto,formaPago,tipoMoneda,tipoCuenta,entidadFinanciera,jornadaLaboral,contratoadministradoras($expand=administradora($expand=tipoAdministradora)),contratocentrotrabajos($expand=centrotrabajo),tipoCotizanteSubtipoCotizante($expand=tipoCotizante,subtipoCotizante),tipoPeriodo`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratos/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }


  public getContratoCentroTrabajo(id: number): Promise<any> {
    const params = `$select=id&$expand=centroTrabajo($select=nombre)&$filter=contratoId eq ${id}`;
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratoCentroTrabajos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroTrabajoChanged.next(response.value);
        resolve();
      }, reject);
    });
  }


  public getData(index: number): Promise<any> {
    // 0 datos basicos
    // 1 otrosi
    if (index == 1) {
      return this._getOtrosi(this.id);
    }

  }


  public refreshOtrosi(): void {
    this.otrosiDataRequest.next(true);
    this._getOtrosi(this.id);
  }


  private _getOtrosi(id: number): Promise<any> {
    const params = encodeURI(
      `$expand=cargodependencia($expand=cargo,dependencia),tipoContrato,centroOperativo,divisionPoliticaNivel2($expand=divisionPoliticaNivel1)&$filter=contratoId eq ${id}`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratoOtrosis?${params}`;
    this.otrosiDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onOtrosiChanged.next(response.value);
        this.otrosiDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/contratoOtrosis/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getFile(funcionarioId) {
    return this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/api/funcionarios/PDFContrato/${funcionarioId}`,
      {
        responseType: 'blob'
      })
  }
}
