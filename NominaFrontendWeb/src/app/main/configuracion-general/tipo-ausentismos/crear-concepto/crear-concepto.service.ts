import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class CrearConceptoService {

  id: any | null;

  onConceptoNominasChanged: BehaviorSubject<any[]>;


  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onConceptoNominasChanged = new BehaviorSubject([]);
  }



  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any, accion: string): Promise<any> {
    if (accion === 'editar') {
      return this.editar(dato.id, dato);
    }
    return this.crear(dato);
  }




  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/TipoAusentismoConceptoNominas`, dato)
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
  private editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/TipoAusentismoConceptoNominas/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  public getConceptoNominaLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptonominas?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


}

