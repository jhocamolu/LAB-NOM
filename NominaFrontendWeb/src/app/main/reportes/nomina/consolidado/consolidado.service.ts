import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ConsolidadoService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/reporte/Consolidadoconceptosnomina`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getConcepto(): Promise<any> {
    const params = encodeURI(`$select=id,nombre&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/conceptoNominas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getSoloConcepto(filtro: string): Promise<any> {
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
