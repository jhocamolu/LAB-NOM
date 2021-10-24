import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

  id: any | null;

  item: any | null;
  onItemChanged: BehaviorSubject<any>;
  onEntidadFinancierasChanged: BehaviorSubject<any[]>;
  onNovedadesChanged: BehaviorSubject<any[]>;
  onTipoPeriodosChanged: BehaviorSubject<any[]>;

  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onEntidadFinancierasChanged = new BehaviorSubject([]);
    this.onNovedadesChanged = new BehaviorSubject([]);
    this.onTipoPeriodosChanged = new BehaviorSubject([]);
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

    this.id = route.params.id;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);

    const promises = [
      // this._getEntidadFinancieras(),
      this.getTipoPeriodos(this.item)
    ];
    if (this.id != null) {
      promises.push(this._getNovedad(this.id));
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
   * @returns {Promise<any>}
   */
  private _getNovedad(id: number): Promise<any> {
    const expand = '$expand=funcionario,categoriaNovedad($expand=conceptoNomina)';
    const url = `${environmentAlcanos.novedades}/odata/novedades/${id}?${expand}`;
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
   * @param id
   * @returns {Promise<any>}
   */
  public getSubPeriodos(id: number): Promise<any> {
    const params = encodeURI(`$filter=tipoPeriodoId eq ${id}`);
    const url = `${environmentAlcanos.novedades}/odata/subperiodos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }



  /**
   *  PERIODO DE PAGO
   * @returns {Promise<any>}
   */
  public getTipoPeriodos(value: any): Promise<any> {
    let params;
    if (value != null) {
      params = encodeURI(`$filter=estadoRegistro eq 'Activo'`);
    } else {
      params = encodeURI(`$filter=pagoPorDefecto eq true`);
    }
    const url = `${environmentAlcanos.novedades}/odata/TipoPeriodos?&${params}&$count=true&$orderby=nombre asc`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoPeriodosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param id
   * @returns {Promise<any>}
   */
  public getTipoPeriodosId(id: number): Promise<any> {
    const url = encodeURI(`${environmentAlcanos.configuracionGeneral}/odata/tipoperiodos/${id}`);
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
  public getDatosActuales(id: number): Promise<any> {
    const urlEncode = encodeURI(`$expand=contrato`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }


  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.item != null && this.id != null) {
      return this.editar(this.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.novedades}/api/novedades/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.novedades}/api/novedades`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getNovedades(filtro: string): Promise<any> {
    const nombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const expand = `$expand=conceptoNomina`;
    const filter = `$filter=(${nombre}) and usaParametrizacion eq true and estadoRegistro eq 'Activo'`;
    const params = encodeURI(`${orderby}&${filter}&${expand}`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/categoriaNovedades?${params}`;
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
  public getTerceroAdministradoras(filtro: any): Promise<any> {
    const nombre = `contains(nombre, '${filtro}')`;
    const nit = `contains(nit, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const select = `$select=id,nit,nombre`;
    const filter = `$filter=(${nombre} or ${nit}) and estadoRegistro eq 'Activo'`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/administradoras?${params}`;
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
  public getTerceroAdministradorasSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=id,nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/administradoras/${id}?${urlEncode}`;
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
  public getTerceroEntidadFinancieras(filtro: any): Promise<any> {
    const nombre = `contains(nombre, '${filtro}')`;
    const nit = `contains(nit, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const select = `$select=id,nit,nombre`;
    const filter = `$filter=(${nombre} or ${nit}) and estadoRegistro eq 'Activo'`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/entidadFinancieras?${params}`;
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
  public getTerceroEntidadFinancierasSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=id,nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/entidadFinancieras/${id}?${urlEncode}`;
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
  public getTerceroOtroTercero(filtro: any): Promise<any> {
    const nombre = `contains(nombre, '${filtro}')`;
    const nit = `contains(nit, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const select = `$select=id,nit,nombre`;
    const filter = `$filter=(${nombre} or ${nit}) and estadoRegistro eq 'Activo'`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/terceros?${params}`;
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
  public getTerceroOtroTerceroSolo(id: any): Promise<any> {
    const urlEncode = encodeURI(`$select=id,nit,nombre`);
    const url = `${environmentAlcanos.configuracionGeneral}/odata/terceros/${id}?${urlEncode}`;
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
  public getFuncionarios(filtro: string): Promise<any> {
    const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
    const orderby = `$orderby=criterioBusqueda`;
    // tslint:disable-next-line: max-line-length
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,criterioBusqueda`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getNovedadSubperiodos(id: number): Promise<any> {
    const params = encodeURI(`$expand=subperiodo($expand=tipoperiodo)&$filter=NovedadId eq ${id}&$count=true`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.novedades}/odata/novedadsubperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }
}

