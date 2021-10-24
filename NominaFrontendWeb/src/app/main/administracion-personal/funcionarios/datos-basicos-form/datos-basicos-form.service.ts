import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class DatosBasicosService implements Resolve<any>{

  id: number | null;
  item: any | null;
  onItemChanged: BehaviorSubject<any>;

  //
  onGenerosChanged: BehaviorSubject<any[]>;
  onEstadoCivilesChanged: BehaviorSubject<any[]>;
  onOcupacionesChanged: BehaviorSubject<any[]>;
  onPaisesChanged: BehaviorSubject<any[]>;

  onTipoDocumentosChanged: BehaviorSubject<any[]>;
  onClaseLibretaMilitaresChanged: BehaviorSubject<any[]>;
  onTipoViviendasChanged: BehaviorSubject<any[]>;
  onLicenciasAChanged: BehaviorSubject<any[]>;
  onLicenciasBChanged: BehaviorSubject<any[]>;
  onLicenciasCChanged: BehaviorSubject<any[]>;
  onTipoSangresChanged: BehaviorSubject<any[]>;


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

    this.onGenerosChanged = new BehaviorSubject([]);
    this.onEstadoCivilesChanged = new BehaviorSubject([]);
    this.onOcupacionesChanged = new BehaviorSubject([]);
    this.onPaisesChanged = new BehaviorSubject([]);
    this.onTipoDocumentosChanged = new BehaviorSubject([]);
    this.onClaseLibretaMilitaresChanged = new BehaviorSubject([]);
    this.onTipoViviendasChanged = new BehaviorSubject([]);
    this.onClaseLibretaMilitaresChanged = new BehaviorSubject([]);
    this.onLicenciasAChanged = new BehaviorSubject([]);
    this.onLicenciasBChanged = new BehaviorSubject([]);
    this.onLicenciasCChanged = new BehaviorSubject([]);
    this.onTipoSangresChanged = new BehaviorSubject([]);


  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = null;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [
      this.getGeneros(),
      this.getEstadosCiviles(),
      this.getOcupaciones(),
      this.getPaises(),
      this.getTipoDocumentos(),
      this.getTipoViviendas(),
      this.getClaseLibretaMilitares(),
      this.getLicenciasA(),
      this.getLicenciasB(),
      this.getLicenciasC(),
      this.getTipoSangres(),
    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this._getFuncionaro(this.id));
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
  private _getFuncionaro(id: number): Promise<any> {
    const params =
      // tslint:disable-next-line: max-line-length
      `?$expand=tipoDocumento,sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,LicenciaConduccionA,LicenciaConduccionB,LicenciaConduccionC,TipoSangre`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarios/${id}${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);

        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getGeneros(): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/sexos?$orderby=nombre`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onGenerosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getEstadosCiviles(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/estadoCiviles?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onEstadoCivilesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getOcupaciones(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/ocupaciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onOcupacionesChanged.next(response.value);
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
  private getTipoViviendas(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipoViviendas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoViviendasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getClaseLibretaMilitares(): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/claseLibretaMilitares`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onClaseLibretaMilitaresChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getLicenciasA(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'A'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/licenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasAChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getLicenciasB(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'B'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/licenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasBChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getLicenciasC(): Promise<any> {
    const params = encodeURI(`$filter=clase eq 'C'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/licenciaConducciones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onLicenciasCChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoSangres(): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipoSangres`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoSangresChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item !== null && this.id !== null) {
      return this._editar(this.item.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/funcionarios/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/funcionarios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


}
