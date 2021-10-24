import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MostrarPrenominaService {

  item: any;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  
  constructor(
    private _httpClient: HttpClient
    
  ) { 
   
  }

  /**
   * @param resolve
   * @id Id del funcionario
   * @returns {Promise<any>}
   */
  public getPrenominaDetalle(id: number): Promise<any> {
    const params = encodeURI(`$filter=nominaFuncionarioId eq ${id}&$expand=ConceptoNomina&$count=true`);
    const orderby = encodeURI(`$orderby=conceptoNomina/orden asc`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominadetalles?${params}&${orderby}`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}

