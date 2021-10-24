import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  constructor(
    private _httpClient: HttpClient
  ) { }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getImagenPerfil(url:string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.gestorArchivos}/${url}`,
      {
        responseType: 'blob' 
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
