import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class CrearService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**este es el servicio
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/tipohoraextras`, dato)
        .subscribe((response: any) => {
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
    const filter = `$filter=(${filterCodigo} or ${filterNombre}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,codigo,nombre`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/conceptoNominas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }
}
