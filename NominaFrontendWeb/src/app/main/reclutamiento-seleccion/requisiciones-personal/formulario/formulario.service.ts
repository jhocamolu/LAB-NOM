
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { contratosAlcanos } from '@alcanos/constantes/contratos';
import { paisAlcanos } from '@alcanos/constantes/paises';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

  id: number | null;
  item: any | null;
  onItemChanged: BehaviorSubject<any>;
  changed: any;

  contrato: any;

  // BehaviorSubject
  onTipoContratosChanged: BehaviorSubject<any[]>;
  onDependenciasChanged: BehaviorSubject<any[]>;
  onCargoChanged: BehaviorSubject<any[]>;
  onCentroCostosChanged: BehaviorSubject<any[]>;
  onFormaPagosChanged: BehaviorSubject<any[]>;
  onCentroOperativosChanged: BehaviorSubject<any[]>;
  onMotivoVacantes: BehaviorSubject<any[]>;

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
    this.onTipoContratosChanged = new BehaviorSubject([]);
    this.onDependenciasChanged = new BehaviorSubject([]);
    this.onCargoChanged = new BehaviorSubject([]);
    this.onCentroCostosChanged = new BehaviorSubject([]);
    this.onFormaPagosChanged = new BehaviorSubject([]);
    this.onCentroOperativosChanged = new BehaviorSubject([]);
    this.onMotivoVacantes = new BehaviorSubject([]);
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
      this.getTipoContratos(),
      this.getDependencias(),
      this.getCentroCostos(),
      this.getCentroOperativos(),
      this.getMotivoVacantes(),
    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this._getRequisicionPersonales(this.id));
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
  private _getRequisicionPersonales(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargoDependenciaSolicitante($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro,clase) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitante($select=id,codigo,nombre,estadoRegistro), funcionarioSolicitante($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda) ,cargoDependenciaSolicitado($select=id,cargoId,dependenciaId,estadoRegistro; $expand=cargo($select=id,codigo,nombre,estadoRegistro,clase) ,dependencia($select=id,codigo,nombre,estadoRegistro)), centroOperativoSolicitado($select=id,codigo,nombre,estadoRegistro), divisionPoliticaNivel2($select=id,codigo,nombre,estadoRegistro,divisionPoliticaNivel1Id; $expand=divisionPoliticaNivel1($select=id,codigo,nombre,estadoRegistro)), tipoContrato($select=id,nombre,terminoIndefinido), centroCosto($select=id,nombre), motivoVacante ($select=id,codigo,nombre,requiereNombreAQuienReemplaza), funcionarioAQuienReemplaza($select=id,primerNombre,segundoNombre,primerApellido,segundoApellido,criterioBusqueda)`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/Requisicionpersonales/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }

  public getOnlyContrato(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=tipoContrato,funcionario($expand=tipoDocumento),divisionPoliticaNivel2($expand=divisionPoliticaNivel1),centroTrabajo,centroOperativo,centroCosto,formaPago,tipoMoneda,tipoCuenta,entidadFinanciera,jornadaLaboral,contratoadministradoras($expand=administradora($expand=tipoAdministradora))`
    );
    const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getCentroOperativos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrooperativos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroOperativosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getMotivoVacantes(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/motivovacantes?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onMotivoVacantes.next(response.value);
        resolve(response);
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
        this.onDependenciasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param value // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getSoloCargoDependencias(filtro: number): Promise<any> {
    const filterNombre = `contains(cargo/nombre, '${filtro}')`;
    const orderby = `$orderby=cargo/nombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
    const select = `$expand=cargo($select=id,nombre,clase)`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  // public getClaseCargos(id: number): Promise<any> {
  //   const params = encodeURI(`$select=id,codigo,nombre,clase`);
  //   const url = `${environmentAlcanos.administracionPersonal}/odata/cargos/${id}?${params}`;
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.get(url).subscribe((response: any) => {
  //       resolve(response);
  //     }, reject);
  //   });
  // }

  public getDependenciaAdicionales(id: number): Promise<any> {
    const params = encodeURI(`$expand=dependencia($select=id,nombre)&$filter=cargoId eq ${id}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`;
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
  public getClaseCargoDependencias(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargo($select=id,nombre,clase)`);
    let url = `${environmentAlcanos.administracionPersonal}/odata/cargoDependencias/${id}?${params}`;
    if (id) {
      url = `${environmentAlcanos.administracionPersonal}/odata/cargoDependencias/${id}?${params}`;
    }
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getTerminoIndefinido(id: number): Promise<any> {
    const params = encodeURI(`$select=id,terminoIndefinido,nombre,clase`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipocontratos/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getRequiereNombreAQuienReemplaza(id: number): Promise<any> {
    const params = encodeURI(`$select=id,requiereNombreAQuienReemplaza,nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/motivovacantes/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
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
        resolve(response);
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
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getCentroCostos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrocostos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroCostosChanged.next(response.value);
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

  /**
   * 
   * @returns {Promise<any>}
   */
  public getFuncionariosEspecial(filtro: string, dependencia: number, cargo: number, centroOperativo: number): Promise<any> {
    let filterCentroOperativo = '';
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    if (centroOperativo != null) {
      filterCentroOperativo = `and centroOperativoId eq ${centroOperativo}`;
    }
    const orderby = `$orderby=primerNombre`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and contrato/estado eq 'Vigente' and dependenciaId eq ${dependencia} and cargoId eq ${cargo} ${filterCentroOperativo}`;
    const select = `$select=id,criterioBusqueda,contratoId,cargoId,dependenciaId,centroOperativoId`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/funcionarioDatoActuales?${params}`;
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
  public getContratos(id: number): Promise<any> {
    const params = encodeURI(`$filter=estado eq 'Vigente' and funcionarioId eq ${id} and estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/?$count=true&${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        // this.onEntidadFinancierasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  public getContratosFilter(id: number): Promise<any> {
    const params = encodeURI(`$filter=funcionarioId eq ${id} and estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/?$count=true&${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/Requisicionpersonales/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/Requisicionpersonales`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
