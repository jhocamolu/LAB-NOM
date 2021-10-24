import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DiaMostrarService {

  /// variables para manejar paginacion y order
  id: number;
  onItemsChange: BehaviorSubject<any[]>;
  dataRequest: BehaviorSubject< boolean>;


  constructor(private _httpClient: HttpClient) {
    this.onItemsChange = new BehaviorSubject([]);
    this.dataRequest = new BehaviorSubject(true);
  }



  public init(id): Promise<any> {
    this.id = id;
    this.onItemsChange.next([]);
    this.dataRequest.next(true);
    return this._getJornadaDias(this.id);
  }

  public refreshJornadas(): void {
    this.dataRequest.next(true);
    this._getJornadaDias(this.id);
  }

  private _getJornadaDias(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = encodeURI(`$filter=jornadaLaboralId eq ${id}`);
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/jornadaLaboralDias/?${params}`)
        .subscribe((response: any) => {
          this.onItemsChange.next(response.value);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/jornadaLaboralDias/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
