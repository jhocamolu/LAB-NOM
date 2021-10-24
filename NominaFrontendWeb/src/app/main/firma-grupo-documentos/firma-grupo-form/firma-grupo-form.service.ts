import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
  providedIn: 'root'
})
export class FirmaGrupoFormService {
  id: any | null;

  item: any | null;
  onItemChanged: BehaviorSubject<any>;

  onGrupoDocumentosChanged: BehaviorSubject<any[]>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onGrupoDocumentosChanged = new BehaviorSubject([]);
  }


  public getResultado(element: any): Promise<any> {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);

    if (element != null) {
      return this._getRepresentanteEmpresas(element.id);
    }

  }


  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getRepresentanteEmpresas(id: number): Promise<any> {
    const expand = '$expand=funcionario';
    const url = `${environmentAlcanos.nomina}/odata/representanteempresas/${id}?${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChanged.next(this.item);
          resolve();
        }, reject);
    });
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item != null && dato.id != null) {
      return this.editar(dato.id, dato);
    }
    return this.crear(dato);
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/representanteempresas/${id}`, dato)
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
  private crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/representanteempresas`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getGrupoDocumentosLista(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.plantillas}/odata/grupodocumentos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=primerNombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  // /**
  //  * 
  //  * @returns {Promise<any>}
  //  */
  // public getFuncionarios(filtro: string): Promise<any> {
  //   const filterPrimerNombre = `contains(primerNombre, '${filtro}')`;
  //   const filterSegundoNombre = `contains(segundoNombre, '${filtro}')`;
  //   const filterPrimerApellido = `contains(primerApellido, '${filtro}')`;
  //   const filterSegudoApellido = `contains(segundoApellido, '${filtro}')`;
  //   const filterDocumento = `contains(numeroDocumento, '${filtro}')`;
  //   const orderby = `$orderby=primerNombre`;
  //   // tslint:disable-next-line: max-line-length
  //   const filter = `$filter=(${filterPrimerNombre} or ${filterSegundoNombre} or ${filterPrimerApellido} or ${filterSegudoApellido} or ${filterDocumento}) and estadoRegistro eq 'Activo'`;
  //   const select = `$select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,tipoDocumentoId,numeroDocumento`;
  //   const params = encodeURI(`${orderby}&${filter}&${select}`);
  //   const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios?${params}`;
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.get(url).subscribe((response: any) => {
  //       resolve(response.value);
  //     }, reject);
  //   });
  // }

}
