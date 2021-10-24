import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class MostrarService implements Resolve<any> {
  tab: number;
  id: number;

  item: any;
  onItemChanged: BehaviorSubject<any>;
  onEstudiosChanged: BehaviorSubject<any[]>;
  onExperienciasChanged: BehaviorSubject<any[]>;
  onDocumentosChanged: BehaviorSubject<any[]>;

  estudioDataRequest: BehaviorSubject<boolean>;
  experienciaDataRequest: BehaviorSubject<boolean>;
  documentoDataRequest: BehaviorSubject<boolean>;

  /**
   *
   * @param _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onItemChanged = new BehaviorSubject({});
    this.onEstudiosChanged = new BehaviorSubject([]);
    this.onExperienciasChanged = new BehaviorSubject([]);
    this.onDocumentosChanged = new BehaviorSubject([]);


    this.estudioDataRequest = new BehaviorSubject(true);
    this.experienciaDataRequest = new BehaviorSubject(true);
    this.documentoDataRequest = new BehaviorSubject(true);
    this.tab = 0;
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.id = route.params.id;

    this.tab = route.queryParams.tab != null ? route.queryParams.tab : 0;
    const promises = [this.getAspirante(this.id)];
    if (this.tab != 0) {
      promises.push(this.getData(this.tab));
    }
    return new Promise((resolve, reject) => {
      Promise.all(
        promises
      ).then(
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
  public getAspirante(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),tipoDocumento,divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,TipoSangre,licenciaConduccionA,licenciaConduccionB,licenciaConduccionC`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/HojaDeVidas/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }



  public getData(index: number): Promise<any> {

    // 0 informacion  basica
    // 1 estudios
    // 2 experiencias 
    // 3 documentos

    if (index == 1) {
      return this._getEstudios(this.id);
    }

    if (index == 2) {
      return this._getExperiencias(this.id);
    }

    if (index == 3) {
      return this._getDocumentos(this.id);
    }
  }



  public getEstudios(): void {
    this.onEstudiosChanged.next([]);
    this._getEstudios(this.id);
  }

  eliminarEstudios(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/HojaDeVidaEstudios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getEstudios(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=hojaDeVidaId eq ${id} and estadoRegistro eq 'Activo'&$expand=pais,nivelEducativo,profesion&$orderBy=fechaCreacion desc`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/HojaDeVidaEstudios?${params}`;
    this.estudioDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onEstudiosChanged.next(response.value);
        this.estudioDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  public getExperiencias(): void {
    this.onExperienciasChanged.next([]);
    this._getExperiencias(this.id);
  }


  eliminarExperiencia(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/HojaDeVidaExperienciaLaborales/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getExperiencias(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=hojaDeVidaId eq ${id} and estadoRegistro eq 'Activo'&$orderBy=fechaInicio desc`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/HojaDeVidaExperienciaLaborales?${params}`;
    this.experienciaDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onExperienciasChanged.next(response.value);
        this.experienciaDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }


  public getDocumentos(): void {
    this.onDocumentosChanged.next([]);
    this._getDocumentos(this.id);
  }

  eliminarDocumento(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/HojadeVidaDocumentos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getDocumentos(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=hojaDeVidaId eq ${id} and estadoRegistro eq 'Activo'&$expand=tipoSoporte`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/HojadeVidaDocumentos?${params}`;
    this.documentoDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onDocumentosChanged.next(response.value);
        this.documentoDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

}
