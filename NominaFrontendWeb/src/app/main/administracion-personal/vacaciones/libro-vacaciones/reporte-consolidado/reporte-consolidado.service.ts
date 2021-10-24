import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
  providedIn: 'root'
})
export class ReporteConsolidadoService {

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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/reporte/LibroVacaciones`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getCentroOperativosLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/centrooperativos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  getDependenciasLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/dependencias?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
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
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda,estado`;
    const params = encodeURI(`${orderby}&${filter}&${select}&$count=true`);
    const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

}
