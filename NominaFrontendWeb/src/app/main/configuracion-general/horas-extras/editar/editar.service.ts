import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EditarService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * @param id
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/tipohoraextras/${id}`, dato)
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

  getConceptosFiltro(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$select=id,codigo,nombre&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/conceptoNominas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

}
