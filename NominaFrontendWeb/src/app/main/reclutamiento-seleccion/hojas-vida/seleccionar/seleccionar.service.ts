import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeleccionarService {

  constructor(
    private _httpClient: HttpClient
  ) { }


  public getRequisiciones(): Promise<any> {
    const params = encodeURI(`$expand=cargoDependenciaSolicitante($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitante($select=id,codigo,nombre,estadoRegistro), funcionarioSolicitante($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda) ,cargoDependenciaSolicitado($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitado($select=id,codigo,nombre,estadoRegistro), divisionPoliticaNivel2($select=id,codigo,nombre,estadoRegistro,divisionPoliticaNivel1Id; $expand=divisionPoliticaNivel1($select=id,codigo,nombre,estadoRegistro)), tipoContrato($select=id,nombre), centroCosto($select=id,nombre), motivoVacante ($select=id,codigo,nombre,requiereNombreAQuienReemplaza), funcionarioAQuienReemplaza($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda)&$filter=estado eq 'Autorizada'`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/Requisicionpersonales?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public estado(dato: any): Promise<any> {    
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.novedades}/api/Candidatos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
