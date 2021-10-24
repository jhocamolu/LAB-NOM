import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { paisAlcanos } from '@alcanos/constantes/paises';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  id: number;
  onItemsChanged: BehaviorSubject<any>;
  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {

  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getActividadCentroCostos(id: number): Promise<any> {
    const paramsAdd = encodeURI(`$select=id,actividadId,centroCostoId,municipioId,estadoRegistro&$expand=actividad($select=id,nombre,codigo,estadoRegistro),centroCosto($select=id,nombre,codigo,estadoRegistro),municipio($expand=divisionPoliticaNivel1)`);
    const url = `${environmentAlcanos.nomina}/odata/ActividadCentroCostos/${id}?${paramsAdd}`;
    
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }


  public getCentroCostos(id: string): Promise<any> {
    const value = id.substring(0, 2) + '-' + id.substring(2, 5);
    const orderby = `$orderby=nombre`;
    //$select=id,nombre,codigo,estadoRegistro
    const filter = `$filter=contains(codigo,'${value}')`;
    const params = encodeURI(`${orderby}&${filter}`);
    const url = `${environmentAlcanos.nomina}/odata/centrocostos?${params}`;
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
  public getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$top=1&$filter=estadoRegistro eq 'Activo' and codigo eq '${paisAlcanos.colombia}'`);
    const url = `${environmentAlcanos.nomina}/odata/paises?${params}`;
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
    const url = `${environmentAlcanos.nomina}/odata/divisionPoliticaNiveles1?${params}`;
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
    const url = `${environmentAlcanos.nomina}/odata/divisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getMunicipiosId(id: number): Promise<any> {
    const params = encodeURI(`?$select=divisionPoliticaNivel1Id,id,codigo,nombre`);
    const url = `${environmentAlcanos.nomina}/odata/divisionPoliticaNiveles2/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(this.getCentroCostos(response.codigo));
      }, reject);
    });
  }



  public upsert(dato: any): Promise<any> {
    if (dato.id) {
      return this._editar(dato);
    }
    return this._crear(dato);
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/ActividadCentroCostos`, dato)
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
  private _editar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/ActividadCentroCostos/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
