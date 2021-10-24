import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EditarService implements Resolve<any> {

  id: number;
  tipoLiquidaciones: any[];
  onTipoLiquidacionesChanged: BehaviorSubject<any>;

  onDataConceptos: BehaviorSubject<any[]>;
  selectedTab: number;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onTipoLiquidacionesChanged = new BehaviorSubject({});

    this.onDataConceptos = new BehaviorSubject([]);
    this.selectedTab = 0;
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
    if (route.queryParams.tab != null) {
      this.selectedTab = route.queryParams.tab;
    } else {
      this.selectedTab = 0;
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getTipoLiquidacion(this.id),
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getTipoLidacion(): void {
    this._getTipoLiquidacion(this.id);
  }

  /**
   * 
   * @param id // Obtiene datos del tipo liquidaciones
   * @returns {Promise<any>}
   */
  private _getTipoLiquidacion(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = encodeURI(`$expand=conceptoNominaAgrupador($select=id,nombre,alias,codigo,conceptoAgrupador),tipoPeriodo`);
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoliquidaciones/${id}?${params}`)
        .subscribe((response: any) => {
          this.tipoLiquidaciones = response;
          this.onTipoLiquidacionesChanged.next(this.tipoLiquidaciones);
          resolve(response);
        }, reject);
    });

  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getConceptos(filtro: string): Promise<any> {
    const filterCodigo = `contains(codigo, '${filtro}')`;
    const filterNombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const filter = `$filter=(${filterCodigo} or ${filterNombre}) and conceptoAgrupador eq true and estadoRegistro eq 'Activo'`;
    const select = `$select=id,codigo,nombre`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/conceptoNominas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * @param resolve 
   * @returns {Promise<any>}
   * Obtiene Todos los tipo periodos para llenar select asc Nombre
   */
  getTipoPeriodoLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * @param resolve 
   * @returns {Promise<any>}
   * Obtiene Todos los tipo periodos para llenar select asc Nombre
   */
  getTipoliquidacionModulos(id: number): Promise<any> {
    const params = encodeURI(`$filter=tipoLiquidacionId eq ${id}&$select=id,tipoLiquidacionId,modulo`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/TipoliquidacionModulos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  borrarConcepto(): void { }

  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/tipoliquidaciones/${id}`,
        dato)
        .subscribe((response: any) => {
          resolve(response);

        }, reject);
    });
  }

}
