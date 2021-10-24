import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { paisAlcanos } from '@alcanos/constantes/paises';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  id: any | null;

  item: any | null;
  onItemChanged: BehaviorSubject<any>;

  onClaseAusentismosChanged: BehaviorSubject<any[]>;
  onDiagnosticosChanged: BehaviorSubject<any[]>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onClaseAusentismosChanged = new BehaviorSubject([]);
    this.onDiagnosticosChanged = new BehaviorSubject([]);
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

    const promises = [];
    if (this.id != null) {
      promises.push(this._getTerceros(this.id));
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
  private _getTerceros(id: number): Promise<any> {
    const expand = '$select=id,nombre,nit,digitoVerificacion,divisionPoliticaNivel2Id,telefono ,direccion,entidadFinancieraId,tipoCuentaId,numeroCuenta,descripcion,estadoRegistro &$expand=divisionPoliticaNivel2($select=id, codigo,nombre,divisionPoliticaNivel1id; $expand=divisionPoliticaNivel1($select=id, codigo,nombre,paisid; $expand=pais($select=id,codigo, nombre))), entidadFinanciera($select=id, codigo,nombre), tipoCuenta($select=id, nombre)';
    const url = `${environmentAlcanos.novedades}/odata/terceros/${id}?${expand}`;
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
      this._httpClient.put(`${environmentAlcanos.novedades}/api/terceros/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.novedades}/api/terceros`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$top=1&$filter=estadoRegistro eq 'Activo' and codigo eq '${paisAlcanos.colombia}'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/paises?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param paisId 
   * @returns {Promise<any>}
   */
  public getDepartamentos(paisId: number): Promise<any> {
    const params = encodeURI(`$filter=paisId eq ${paisId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles1?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param departamentoId 
   * @returns {Promise<any>}
   */
  public getMunicipios(departamentoId: number): Promise<any> {
    const params = encodeURI(`$filter=divisionPoliticaNivel1Id eq ${departamentoId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getEntidadFinancieras(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/EntidadFinancieras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoCuentas(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipocuentas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


}

