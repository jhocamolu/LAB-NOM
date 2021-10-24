import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  id: any | null;

  item: any | null;

  onItemChanged: BehaviorSubject<any>;

  onMotivoSolicitudChanged: BehaviorSubject<any[]>;


  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onMotivoSolicitudChanged = new BehaviorSubject([]);
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
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);

    const promises = [
      this._getMotivoSolicitudCesantias(),
    ];
    if (this.id != null) {
      promises.push(this._getSolicitudCesantias(this.id));
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
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
  private _getSolicitudCesantias(id: number): Promise<any> {
    const expand = '$expand=funcionario,motivoSolicitudCesantia';
    const url = `${environmentAlcanos.nomina}/odata/SolicitudCesantias/${id}?${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChanged.next(this.item);
          resolve();
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getDatosActuales(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}`;
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
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=criterioBusqueda`;
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda,estado`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.nomina}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getDatosCesantias(id: number): Promise<any> {
    const url = `${environmentAlcanos.novedades}/api/SolicitudCesantias/DatosCesantias/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private _getMotivoSolicitudCesantias(): Promise<any> {
    const params = encodeURI(`$orderby=nombre`);
    const url = `${environmentAlcanos.novedades}/odata/MotivoSolicitudCesantias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onMotivoSolicitudChanged.next(response.value);
        resolve();
      }, reject);
    });
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item != null && this.id != null) {
      return this.editar(this.id, dato);
    }
    return this.crear(dato);
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/SolicitudCesantias/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/SolicitudCesantias`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }





  upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
    return new Promise((resolve, reject) => {
      this._httpClient.post(url, formData)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
