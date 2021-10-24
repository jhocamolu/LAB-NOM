import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(
    private _httpClient: HttpClient
  ) { 
  
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  public getDatosActuales(id: number): Promise<any> {

    const url = `${environmentAlcanos.configuracionGeneral}/api/funcionarios/${id}/datosActuales`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }



  public editarImg(id: number, img: string): Promise<any> {
    const dato = {
      id: id,
      adjunto: img
    };
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.administracionPersonal}/api/funcionarios/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
