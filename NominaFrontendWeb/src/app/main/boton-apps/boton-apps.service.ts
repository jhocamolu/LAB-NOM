import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class BotonAppsService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getEnlaceExternos(): Promise<any> {
    const url = `${environmentAlcanos.nomina}/odata/_EnlaceExternos?$orderBy=titulo`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}
