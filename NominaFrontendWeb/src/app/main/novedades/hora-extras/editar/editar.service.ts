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
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/Horaextras/${id}`, dato)
        .subscribe((response: any) => {
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
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  getHoraExtrasLista(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tipohoraextras?$orderby=tipo asc&$filter=estadoRegistro eq 'Activo'&$select=id,tipo`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }



  /**
   * 
   * @returns {Promise<any>}
   */
  public getDatosActuales(id: number): Promise<any> {
    //const urlEncode = encodeURI(`$select=id,primerNombre,primerApellido,numeroDocumento,adjunto,estado&$expand=contrato($select=estado;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=id,cargoId;$expand=cargo($select=nombre))),ContratoOtroSi($select=fechaAplicacion;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=cargoId;$expand=cargo($select=nombre),dependencia($select=nombre,codigo)))`);
    const urlEncode = encodeURI(`$expand=contrato`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }
  
}
