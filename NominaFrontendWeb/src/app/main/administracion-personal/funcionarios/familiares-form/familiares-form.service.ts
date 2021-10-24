import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FamiliaresService implements Resolve<any>{

  itemFuncionario: any;
  onItemFuncionarioChanged: BehaviorSubject<any>;

  itemFamiliar: any | null;
  onItemFamiliarChanged: BehaviorSubject<any>;

  //
  onSexosChanged: BehaviorSubject<any[]>;
  onParentescosChanged: BehaviorSubject<any[]>;
  onPaisesChanged: BehaviorSubject<any[]>;
  onTipoDocumentosChanged: BehaviorSubject<any[]>;
  onNivelEducativosChanged: BehaviorSubject<any[]>;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.onItemFuncionarioChanged = new BehaviorSubject({});
    this.onItemFamiliarChanged = new BehaviorSubject(null);

    this.onSexosChanged = new BehaviorSubject([]);
    this.onParentescosChanged = new BehaviorSubject([]);
    this.onPaisesChanged = new BehaviorSubject([]);
    this.onTipoDocumentosChanged = new BehaviorSubject([]);
    this.onNivelEducativosChanged = new BehaviorSubject([]);
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.onItemFuncionarioChanged = new BehaviorSubject({});
    this.itemFamiliar = null;
    this.onItemFamiliarChanged = new BehaviorSubject(null);
    const promises = [
      this.getFuncionaro(route.params.id),
      this.getSexos(),
      this.getParentescos(),
      this.getPaises(),
      this.getTipoDocumentos(),
      this.getNivelEducativos(),
    ];
    if (route.params.familiarId != null) {
      promises.push(this.getFamiliar(route.params.familiarId));
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
   * @param id 
   * @returns {Promise<any>}
   */
  private getFuncionaro(id: number): Promise<any> {
    const params =
      `$expand=tipoDocumento,TipoSangre`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.itemFuncionario = response;
        this.onItemFuncionarioChanged.next(this.itemFuncionario);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private getFamiliar(id: number): Promise<any> {
    const params =
      `$expand=divisionPoliticaNivel2($expand=divisionPoliticaNivel1($expand=pais))`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/informacionFamiliares/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.itemFamiliar = response;
        this.onItemFamiliarChanged.next(this.itemFamiliar);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getSexos(): Promise<any> {
    const params = `$orderby=nombre`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/sexos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onSexosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getParentescos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/parentescos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onParentescosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/paises?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onPaisesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param paisId 
   * @returns {Promise<any>}
   */
  public getDepartamentos(paisId: number): Promise<any> {
    const params = encodeURI(`$filter=paisId eq ${paisId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles1?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param departamentoId 
   * @returns {Promise<any>}
   */
  public getMunicipios(departamentoId: number): Promise<any> {
    const params = encodeURI(`$filter=divisionPoliticaNivel1Id eq ${departamentoId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoDocumentos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipoDocumentos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoDocumentosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getNivelEducativos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/nivelEducativos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onNivelEducativosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.itemFamiliar != null && this.itemFamiliar.id != null) {
      return this._editar(this.itemFamiliar.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/informacionFamiliares/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/informacionFamiliares`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
