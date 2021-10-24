import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { paisAlcanos } from '@alcanos/constantes/paises';


@Injectable({
  providedIn: 'root'
})
export class CrearOtrosiService implements Resolve<any>{

  id: number;
  item: any | null;
  onItemChanged: BehaviorSubject<any>;


  onTipoContratosChanged: BehaviorSubject<any[]>;
  onDepartamentosChanged: BehaviorSubject<any[]>;
  onDependenciasChanged: BehaviorSubject<any[]>;
  onCargosChanged: BehaviorSubject<any[]>;
  onCentroOperativosChanged: BehaviorSubject<any[]>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onItemChanged = new BehaviorSubject(null);
    this.onTipoContratosChanged = new BehaviorSubject([]);
    this.onDepartamentosChanged = new BehaviorSubject([]);
    this.onDependenciasChanged = new BehaviorSubject([]);
    this.onCargosChanged = new BehaviorSubject([]);
    this.onCentroOperativosChanged = new BehaviorSubject([]);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.id = route.params.id;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    
    const promises = [
      this._getValores(this.id),
      this.getDepartamentos(paisAlcanos.colombia),
      this.getTipoContratos(),
      this.getDependencias(),
      this.getCentroOperativos(),
    ];

    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });

  }

  public getValores(): Promise<any> {
    return this._getValores(this.id);
  }

  /**
   * @param resolve 
   * @returns {Promise<any>}
   * 
   */
  private _getValores(id: number): Promise<any> {
    const params = encodeURI(`$expand=contrato($expand=cargoDependencia($expand=dependencia,cargo),divisionPoliticaNivel2,tipocontrato),contratoOtroSi($expand=cargoDependencia($expand=dependencia,cargo),divisionPoliticaNivel2,tipocontrato)`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/FuncionarioDatoActuales/${id}?${params}`)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChanged.next(response);
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param resolve 
   * @returns {Promise<any>}
   * 
   */
  public getContratos(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/contratos/${id}`)
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
  public crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/contratoOtrosis`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoContratos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipocontratos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoContratosChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getDependencias(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        let data  = []
        response.value.forEach(element => {
          data.push({
            id:element.id,
            codigo:element.codigo,
            nombre:element.nombre,
            autocomplete:element.codigo+ ' - ' +element.nombre
          })
        });
        this.onDependenciasChanged.next(data);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCargo(dependenciaId: number): Promise<any> {
    const params = encodeURI(`$expand=cargo&$filter=estadoRegistro eq 'Activo' and dependenciaId eq ${dependenciaId}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/CargoDependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        let data  = []
        response.value.forEach(element => {
          data.push({
            id:element.id,
            cargoId:element.cargoId,
            dependenciaId:element.dependenciaId,
            cargo:{
              id:element.cargo.id,
              codigo:element.cargo.codigo,
              nombre:element.cargo.nombre,
            },
            autocomplete:element.cargo.codigo+ ' - ' +element.cargo.nombre
          })
        });
        resolve(data);
      }, reject);
    });
  }



  /**
   * 
   * @param  
   * @returns {Promise<any>}
   */
  private getCentroOperativos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/centroOperativos?$orderby=nombre asc`)
        .subscribe((response: any) => {
          this.onCentroOperativosChanged.next(response.value);
          resolve();
        }, reject);
    });
  }



  /**
   * 
   * @returns {Promise<any>}
   */
  public getPaises(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$top=1&$filter=estadoRegistro eq 'Activo' and codigo eq '${paisAlcanos.colombia}'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/paises?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param paisId 
   * @returns {Promise<any>}
   */
  public getDepartamentos(paisId: any): Promise<any> {
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



}
