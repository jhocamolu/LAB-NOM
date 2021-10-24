
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
export class ContratosService implements Resolve<any>{

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
  onTipoMonedasChanged: BehaviorSubject<any[]>;
  onEntidadFinancierasChanged: BehaviorSubject<any[]>;
  onTipoCuentasChanged: BehaviorSubject<any[]>;
  onJornadaLaboralesChanged: BehaviorSubject<any[]>;
  onCentroTrabajosChanged: BehaviorSubject<any[]>;
  onCentroOperativosChanged: BehaviorSubject<any[]>;
  onGrupoNominaChanged: BehaviorSubject<any[]>;
  onFondoCesantiasChanged: BehaviorSubject<any[]>;
  onEPSChanged: BehaviorSubject<any[]>;
  onAFPChanged: BehaviorSubject<any[]>;
  onCCFChanged: BehaviorSubject<any[]>;
  // version 3
  onTipoPeriodosChanged: BehaviorSubject<any[]>;
  onCargoGruposChanged: BehaviorSubject<any[]>;
  onCentroTrabajoSoloChanged: BehaviorSubject<any[]>;
  // version 5
  onTipoCotizanteChanged: BehaviorSubject<any[]>;
  onOtrosiChanged: BehaviorSubject<any[]>;
  otrosiDataRequest: BehaviorSubject<boolean>;
  idOtrosi: number;

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
    this.onTipoMonedasChanged = new BehaviorSubject([]);
    this.onEntidadFinancierasChanged = new BehaviorSubject([]);
    this.onTipoCuentasChanged = new BehaviorSubject([]);
    this.onJornadaLaboralesChanged = new BehaviorSubject([]);
    this.onCentroTrabajosChanged = new BehaviorSubject([]);
    this.onCentroOperativosChanged = new BehaviorSubject([]);
    this.onGrupoNominaChanged = new BehaviorSubject([]);
    // Administradoras
    this.onFondoCesantiasChanged = new BehaviorSubject([]);
    this.onEPSChanged = new BehaviorSubject([]);
    this.onAFPChanged = new BehaviorSubject([]);
    this.onCCFChanged = new BehaviorSubject([]);
    // version 3
    this.onTipoPeriodosChanged = new BehaviorSubject([]);
    this.onCargoGruposChanged = new BehaviorSubject([]);
    // version 5
    this.onTipoCotizanteChanged = new BehaviorSubject([]);

    this.onOtrosiChanged = new BehaviorSubject([]);
    this.onCentroTrabajoSoloChanged = new BehaviorSubject([]);
    this.otrosiDataRequest = new BehaviorSubject(true);
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
    this.onOtrosiChanged.next([]);
    this.otrosiDataRequest.next(true)
    this.idOtrosi = route.params.id;
    const promises = [
      this.getTipoContratos(),
      this.getDependencias(),
      this.getCentroCostos(),
      this.getGrupoNomina(),
      this.getFormaPagos(),
      this.getTipoMonedas(),
      this.getEntidadFinancieras(),
      this.getTipoCuentas(),
      this.getJornadaLaborales(),
      this.getCentroTrabajos(),
      this.getCentroOperativos(),
      // version 3
      this.getTipoPeriodos(),
      // version 5
      this.getTipoCotizantes(),
      // Administradoras
      this.getFondoCesantias(),
      this.getEPS(),
      this.getAFP(),
      this.getCCF(),

    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this._getContrato(this.id));
      promises.push(this._getOtrosi(this.id));
      promises.push(this.getContratoCentroTrabajo(this.id));
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
  private _getContrato(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=tipoContrato,cargodependencia($expand=dependencia,cargo),CargoGrupo($expand=grupo),gruponomina,funcionario($expand=tipoDocumento),divisionPoliticaNivel2($expand=divisionPoliticaNivel1),centroOperativo,centroCosto,formaPago,tipoMoneda,tipoCuenta,entidadFinanciera,jornadaLaboral,contratoadministradoras($expand=administradora($expand=tipoAdministradora)),contratocentrotrabajos($expand=centrotrabajo),tipoCotizanteSubtipoCotizante($expand=tipoCotizante,subtipoCotizante)`
    );
    const url = `${environmentAlcanos.administracionPersonal}/odata/contratos/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.item = response;
        this.item.centroCosto.autocomplete = this.item.centroCosto.codigo + ' - ' + this.item.centroCosto.nombre
        this.onItemChanged.next(this.item);
        resolve(response);
      }, reject);
    });
  }

  public refreshContrato() {
    this.onItemChanged.next(this.item);
    this._getContrato(this.id)
  }



  public getOnlyContrato(id: number): Promise<any> {
    const params = encodeURI(
      // tslint:disable-next-line: max-line-length
      `$expand=tipoContrato,funcionario($expand=tipoDocumento),divisionPoliticaNivel2($expand=divisionPoliticaNivel1),centroTrabajo,centroOperativo,centroCosto,formaPago,tipoMoneda,tipoCuenta,entidadFinanciera,jornadaLaboral,contratoadministradoras($expand=administradora($expand=tipoAdministradora)),tipoCotizanteSubtipoCotizante($expand=tipoCotizante,subtipoCotizante)`
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
  private getDependencias(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        let data = []
        response.value.forEach(element => {
          data.push({
            id: element.id,
            codigo: element.codigo,
            nombre: element.nombre,
            autocomplete: element.codigo + ' - ' + element.nombre
          })
        });
        this.onDependenciasChanged.next(data);
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
        let data = []
        response.value.forEach(element => {
          data.push({
            id: element.id,
            cargoId: element.cargoId,
            dependenciaId: element.dependenciaId,
            cargo: {
              id: element.cargo.id,
              codigo: element.cargo.codigo,
              nombre: element.cargo.nombre,
            },
            autocomplete: element.cargo.codigo + ' - ' + element.cargo.nombre
          })
        });
        resolve(data);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getGrupo(cargoId: number): Promise<any> {
    const params = encodeURI(`$expand=grupo&$filter=estadoRegistro eq 'Activo' and cargoId eq ${cargoId}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/CargoGrupos?${params}`;
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
        let data = []
        response.value.forEach(element => {
          data.push({
            id: element.id,
            codigo: element.codigo,
            nombre: element.nombre,
            autocomplete: element.codigo + ' - ' + element.nombre
          })
        });
        this.onCentroCostosChanged.next(data);
        resolve(data);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getGrupoNomina(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/gruponominas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onGrupoNominaChanged.next(response.value);
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getFormaPagos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo' and habilitaEnContrato eq true`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/formapagos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onFormaPagosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoMonedas(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipomonedas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoMonedasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getEntidadFinancieras(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/EntidadFinancieras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onEntidadFinancierasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoPeriodos(): Promise<any> {
    const params = encodeURI(`$orderby=pagoPorDefecto desc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipoPeriodos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoPeriodosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getTipoCuentas(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipocuentas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoCuentasChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getJornadaLaborales(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/JornadaLaborales?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onJornadaLaboralesChanged.next(response.value);
        resolve(response);
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
  private getCentroTrabajos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/centrotrabajos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroTrabajosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  private getFondoCesantias(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,TipoAdministradora&$filter=TipoAdministradora/estadoRegistro eq 'Activo' and TipoAdministradora/codigo eq '${contratosAlcanos.afc}'  and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/administradoras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onFondoCesantiasChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getEPS(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,TipoAdministradora&$filter=TipoAdministradora/estadoRegistro eq 'Activo' and TipoAdministradora/codigo eq '${contratosAlcanos.eps}'  and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/administradoras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onEPSChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getAFP(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,TipoAdministradora&$filter=TipoAdministradora/estadoRegistro eq 'Activo' and TipoAdministradora/codigo eq '${contratosAlcanos.afp}'  and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/administradoras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onAFPChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getCCF(): Promise<any> {
    const params = encodeURI(`$select=id,nombre,TipoAdministradora&$filter=TipoAdministradora/estadoRegistro eq 'Activo' and TipoAdministradora/codigo eq '${contratosAlcanos.ccf}'  and estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/administradoras?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCCFChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getContratoCentroTrabajo(id: number): Promise<any> {
    const params = `$select=id&$expand=centroTrabajo($select=nombre)&$filter=contratoId eq ${id}`;
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratoCentroTrabajos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onCentroTrabajoSoloChanged.next(response.value);
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
  private getTipoCotizantes(): Promise<any> {
    const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/TipoCotizantes?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.onTipoCotizanteChanged.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  /**
     * 
     * @param paisId 
     * @returns {Promise<any>}
     */
  public getSubTipoCotizantes(tipoCotizanteId: number): Promise<any> {
    const params = encodeURI(`$filter=tipoCotizanteId eq ${tipoCotizanteId} and estadoRegistro eq 'Activo'&$expand=subtipoCotizante&$orderby=subtipoCotizante/nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/TipoCotizanteSubtipoCotizantes?${params}`;
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

    dato.tipoCotizanteSubtipoCotizanteId = dato.subTipoCotizanteId
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/contratos/${id}`, dato)
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
    dato.tipoCotizanteSubtipoCotizanteId = dato.subTipoCotizanteId
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/contratos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }




  public refreshOtrosi(): void {
    this.otrosiDataRequest.next(true);
    this._getOtrosi(this.id);
  }

  private _getOtrosi(id: number): Promise<any> {
    const params = encodeURI(
      `$expand=cargodependencia($expand=cargo,dependencia),tipoContrato,centroOperativo,divisionPoliticaNivel2($expand=divisionPoliticaNivel1)&$filter=contratoId eq ${id}`
    );
    const url = `${environmentAlcanos.configuracionGeneral}/odata/contratoOtrosis?${params}`;
    this.otrosiDataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onOtrosiChanged.next(response.value);
        this.otrosiDataRequest.next(false);
        resolve(response);
      }, reject);
    });
  }

  eliminarHandle(id: number): Promise<any> {
    const url = `${environmentAlcanos.configuracionGeneral}/api/contratoOtrosis/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getFile(funcionarioId) {
    return this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/api/funcionarios/PDFContrato/${funcionarioId}`,
      {
        responseType: 'blob'
      })
  }

}
