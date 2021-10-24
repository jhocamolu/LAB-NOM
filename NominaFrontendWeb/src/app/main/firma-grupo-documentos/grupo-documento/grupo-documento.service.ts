import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class GrupoDocumentoService {

  onItemChanged: BehaviorSubject<any>;

  constructor(
    private _httpClient: HttpClient
  ) { 
    this.onItemChanged = new BehaviorSubject({});
  }

  /**
   *
   *
   * @returns {Promise<any>}
   */
  public getGrupoDocumentos(id: number): Promise<any> {
    const url = `${environmentAlcanos.plantillas}/odata/grupodocumentos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }
}
