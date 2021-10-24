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
  onFamiliaresChanged: BehaviorSubject<any[]>;
  onEstudiosChanged: BehaviorSubject<any[]>;
  onExperienciasChanged: BehaviorSubject<any[]>;
  onContratosChanged: BehaviorSubject<any[]>;
  onDocumentosChanged: BehaviorSubject<any[]>;
  onRetefuenteChanged: BehaviorSubject<any[]>;

  familiarDataRequest: BehaviorSubject<boolean>;
  estudioDataRequest: BehaviorSubject<boolean>;
  experienciaDataRequest: BehaviorSubject<boolean>;
  contratoDataRequest: BehaviorSubject<boolean>;
  documentoDataRequest: BehaviorSubject<boolean>;
  retefuenteDataRequest: BehaviorSubject<boolean>;

  /**
   *
   * @param _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onItemChanged = new BehaviorSubject({});
    this.onFamiliaresChanged = new BehaviorSubject([]);
    this.onEstudiosChanged = new BehaviorSubject([]);
    this.onExperienciasChanged = new BehaviorSubject([]);
    this.onContratosChanged = new BehaviorSubject([]);
    this.onDocumentosChanged = new BehaviorSubject([]);
    this.onRetefuenteChanged = new BehaviorSubject([]);

    this.familiarDataRequest = new BehaviorSubject(true);
    this.estudioDataRequest = new BehaviorSubject(true);
    this.experienciaDataRequest = new BehaviorSubject(true);
    this.contratoDataRequest = new BehaviorSubject(true);
    this.documentoDataRequest = new BehaviorSubject(true);
    this.retefuenteDataRequest = new BehaviorSubject(true);
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
    const promises = [this.getFuncionario(this.id)];
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
  public getFuncionario(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),tipoDocumento,divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,TipoSangre,licenciaConduccionA,licenciaConduccionB,licenciaConduccionC`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/funcionarios/${id}?${params}`;
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
    // 1 familares
    // 2 estudios
    // 3 experiencias 
    // 4 contratos
    // 5 documentos

    if (index == 1) {
      return this._getFamiliares(this.id);
    }

    if (index == 2) {
      return this._getEstudios(this.id);
    }

    if (index == 3) {
      return this._getExperiencias(this.id);
    }

    if (index == 4) {
      return this._getContratos(this.id);
    }

    if (index == 5) {
      return this._getDocumentos(this.id);
    }
    if (index == 6) {
      return this._getretefuente(this.id);
    }
  }

  public getFamiliares(): void {
    this.onFamiliaresChanged.next([]);
    this._getFamiliares(this.id);
  }


  eliminarFamiliares(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/informacionFamiliares/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getFamiliares(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$filter=funcionarioId eq (${id}) and estadoRegistro eq 'Activo'&$expand=parentesco,sexo,tipodocumento,niveleducativo,divisionPoliticaNivel2($expand=divisionPoliticaNivel1($expand=pais))&orderBy=nombre`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/InformacionFamiliares?${params}`;
    this.familiarDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onFamiliaresChanged.next(response.value);
        this.familiarDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  public getEstudios(): void {
    this.onEstudiosChanged.next([]);
    this._getEstudios(this.id);
  }


  // eliminar estudios 
  eliminarEstudios(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/funcionarioEstudios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getEstudios(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'&$expand=pais,nivelEducativo,profesion&$orderBy=fechaCreacion desc`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioEstudios?${params}`;
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
    const url = `${environmentAlcanos.configuracionGeneral}/api/experienciaLaborales/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getExperiencias(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'&$orderBy=fechaCreacion desc`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ExperienciaLaborales?${params}`;
    this.experienciaDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onExperienciasChanged.next(response.value);
        this.experienciaDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  public getContratos(): void {
    this.onContratosChanged.next([]);
    this._getContratos(this.id);
  }


  private _getContratos(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'&$expand=tipoContrato,cargoDependencia($expand=cargo,dependencia),centroOperativo,centroCosto,formaPago,tipoMoneda,tipoCuenta,entidadFinanciera,jornadaLaboral,contratocentrotrabajos($expand=centrotrabajo),divisionPoliticaNivel2($expand=divisionPoliticaNivel1),contratoadministradoras($expand=administradora($expand=tipoAdministradora))`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratos?${params}`;
    this.contratoDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onContratosChanged.next(response.value);
        this.contratoDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }


  public getDocumentos(): void {
    this.onDocumentosChanged.next([]);
    this._getDocumentos(this.id);
  }

  eliminarDocumento(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/documentoFuncionarios/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getDocumentos(id: number): Promise<any> {
    const params = encodeURI(
      `$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'&$expand=tipoSoporte`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/documentoFuncionarios?${params}`;
    this.documentoDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onDocumentosChanged.next(response.value);
        this.documentoDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  public getRetefuente(): void {
    this.onDocumentosChanged.next([]);
    this._getretefuente(this.id);
  }

  eliminarRetefuente(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/DeduccionRetefuentes/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private _getretefuente(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$orderby=annoVigencia/anno desc&$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'&$select=id,funcionarioid,annoVigenciaId,interesVivienda,medicinaPrepagada,estadoRegistro&$Expand=annoVigencia($select=id, anno,estado,estadoRegistro),funcionario($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido)`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/DeduccionRetefuentes?${params}`;
    this.retefuenteDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onRetefuenteChanged.next(response.value);
        this.retefuenteDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsertRetefuente(dato: any): Promise<any> {
    if (this.item != null && dato.id != null) {
      return this.editarRetefuente(dato.id, dato);
    }
    return this.crearRetefuente(dato);
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  private editarRetefuente(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.nomina}/api/DeduccionRetefuentes/${id}`, dato)
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
  private crearRetefuente(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.nomina}/api/DeduccionRetefuentes`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
