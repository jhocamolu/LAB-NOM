import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearLibranzaService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) { }

  /**
   * 
   * @returns {Promise<any>}
   */
  getTipoLiquidaciones(): Promise<any> {
    const params = encodeURI(
      `$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tipoLiquidaciones?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  getSubperiodos(tipoPeriodoId: number): Promise<any> {
    const params = encodeURI(
      `orderby=nombre asc&$filter=tipoPeriodoId eq ${tipoPeriodoId} and estadoRegistro eq 'Activo'`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/subperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.administracionPersonal}/reporte/NovedadesLibranza`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
