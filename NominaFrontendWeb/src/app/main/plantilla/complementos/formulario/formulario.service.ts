import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

  id: number | null;
  grupoDocumentoId: number | null;
  item: any | null;
  onItemChanged: BehaviorSubject<any>;

  onTipoChanged: BehaviorSubject<any[]>;

  onEtiquetasChanged: BehaviorSubject<any[]>;
  onGrupoDocumentoChanged: BehaviorSubject<{}>;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults

    this.onItemChanged = new BehaviorSubject(null);
    this.onEtiquetasChanged = new BehaviorSubject([]);
    this.onTipoChanged = new BehaviorSubject([
      {
        id: 'Encabezado',
        nombre: 'Encabezado',
      },
      {
        id: 'PiePagina',
        nombre: 'Pie de página',
      }
    ]);
    this.onGrupoDocumentoChanged = new BehaviorSubject({});


  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.id = null;
    this.grupoDocumentoId = null;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onEtiquetasChanged = new BehaviorSubject([]);
    this.onGrupoDocumentoChanged = new BehaviorSubject({});
    if (route.params.id) {
      this.id = route.params.id;
    }
    if (route.params.grupoDocumentoId) {
      this.grupoDocumentoId = route.params.grupoDocumentoId;
    }
    const promises = [];
    if (this.id !== null) {
      await this._getComplemento(this.id);
      this.grupoDocumentoId = this.item.grupoDocumentoId;
    }
    if (this.grupoDocumentoId !== null) {
      promises.push(this._getGrupo(this.grupoDocumentoId));
      promises.push(this._getEtiquetas(this.grupoDocumentoId));
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getComplemento(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.plantillas}/odata/complementoPlantillas/${id}?$expand=grupoDocumento`)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChanged.next(this.item);
          resolve();
        }, reject);
    });
  }


  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getGrupo(grupoId: number): Promise<any> {
    const url = `${environmentAlcanos.plantillas}/odata/grupodocumentos/${grupoId}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.onGrupoDocumentoChanged.next(response);
          resolve();
        }, reject);
    });
  }


  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item != null && this.id != null) {
      return this._editar(this.id, dato);
    }
    return this._crear(dato);
  }

  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  private _editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.plantillas}/api/complementoPlantillas/${id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  private _crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.plantillas}/api/complementoPlantillas`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  private _getEtiquetas(grupoId: number): Promise<any> {
    const params = encodeURI(
      `$filter=grupoDocumentoId eq (${grupoId})&$expand=etiqueta`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.plantillas}/odata/GrupoDocumentoEtiquetas/?${params}`)
        .subscribe((response: any) => {
          this.onEtiquetasChanged.next(response.value);
          resolve();
        }, reject);
    });
  }


}
