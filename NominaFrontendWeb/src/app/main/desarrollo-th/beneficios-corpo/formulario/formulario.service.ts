
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { element } from 'protractor';


@Injectable({
  providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

  id: number | null;
  item: any | null;
  changed: any;

  totalCount: number;
  items: any;
  path: any;

  // BehaviorSubject
  onItemChanged: BehaviorSubject<any>;

  onTipoPeriodosChanged: BehaviorSubject<any[]>;
  onTipoBeneficiosChanged: BehaviorSubject<any[]>;
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
    this.onTipoPeriodosChanged = new BehaviorSubject([]);
    this.onTipoBeneficiosChanged = new BehaviorSubject([]);
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
    route.url.map((resp) => {
      this.path = resp.path;
    });
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [
      this.getTipoPeriodos(),
      this.getTipoBeneficios(),
    ];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this.getBeneficios(this.id));
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
  private getBeneficios(id: number): Promise<any> {
    const uriParam = encodeURI('$expand=tipobeneficio,funcionario,tipoPeriodo');
    const url = `${environmentAlcanos.novedades}/odata/beneficios/${id}?${uriParam}`;
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
   * @param id 
   * @returns {Promise<any>}
   */
  public getBeneficiosAdjuntos(beneficioId: number, tipoSoporteId: number): Promise<any> {
    const uriParam = encodeURI(`$filter=beneficioId eq ${beneficioId} and tipoBeneficioRequisito/tipoSoporteId eq ${tipoSoporteId} &$expand=tipoBeneficioRequisito($expand=tipoSoporte)`);
    const url = `${environmentAlcanos.novedades}/odata/BeneficioAdjuntos?${uriParam}`;
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
  public getTipoBeneficios(): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/tipobeneficios?$orderBy=nombre asc`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoBeneficiosChanged.next(response.value);
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  public getTipoBeneficiosId(id: number): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/tipobeneficios?$orderBy=nombre asc`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoBeneficiosChanged.next(response.value);
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
    const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
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
  public getTipoPeriodos(): Promise<any> {
    const url = `${environmentAlcanos.novedades}/odata/TipoPeriodos?$filter=estadoRegistro eq 'Activo'&$count=true&$orderby=nombre asc`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onTipoPeriodosChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * PERIODICIDAD
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
   * 
   * @returns {Promise<any>}
   */
  public getDatosActuales(id: number): Promise<any> {
    //const urlEncode = encodeURI(`$select=id,primerNombre,primerApellido,numeroDocumento,adjunto,estado&$expand=contrato($select=estado;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=id,cargoId;$expand=cargo($select=nombre))),ContratoOtroSi($select=fechaAplicacion;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=cargoId;$expand=cargo($select=nombre),dependencia($select=nombre,codigo)))`);
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
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getRequisito(id: number): Promise<any> {
    const params = encodeURI(`$expand=tipoSoporte,tipoBeneficio&$filter=tipoBeneficioId eq ${id}&$count=true`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.novedades}/odata/tipobeneficiorequisitos?${params}`)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getBeneficioSubperiodos(id: number): Promise<any> {
    const params = encodeURI(`$expand=subPeriodo&$filter=beneficioId eq ${id}&$count=true`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.novedades}/odata/beneficiosubperiodos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  borrar(element: any): Promise<any> {
    const url = `${environmentAlcanos.novedades}/api/BeneficioAdjuntos/${element.id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public _editarArchivo(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/BeneficioAdjuntos/${dato.id}`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   * Cambio de editar a crear según requerimiento
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
      this._httpClient.put(`${environmentAlcanos.novedades}/api/beneficios/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.novedades}/api/beneficios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  /**
   * @param file 
   * @returns {Promise<any>}
   * Actualiza archivos Servicio
   */
  upload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environmentAlcanos.gestorArchivos}/bucket/upload`;
    return new Promise((resolve, reject) => {
      this._httpClient.post(url, formData)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param toLoad 
   * @returns {Promise<any>}
   * Recibe lista de archivos y los organiza en un array para ser envíado al backend
   */
  uploadFilesPrev(toLoad: any[]): Promise<any> {
    const promises: any[] = [];
    toLoad.forEach((element) => {
      promises.push(this.upload(element.file));
    });
    return new Promise((resolve, reject) => {
      return Promise.all(promises).then(
        (resp) => {
          resolve(resp);
        },
        reject
      );
    });
  }

}
