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

  onClaseAusentismosChanged: BehaviorSubject<any[]>;
  onDiagnosticosChanged: BehaviorSubject<any[]>;
  onFuncionariosCountChanged: BehaviorSubject<any[]>;

  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);
    this.onClaseAusentismosChanged = new BehaviorSubject([]);
    this.onDiagnosticosChanged = new BehaviorSubject([]);
    this.onFuncionariosCountChanged = new BehaviorSubject([]);
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
      this._getClaseAusentismos(),
    ];
    if (this.id != null) {
      promises.push(this._getAusentismoFuncionario(this.id));
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
   *
   * @returns {Promise<any>}
   */
  private _getAusentismoFuncionario(id: number): Promise<any> {
    const expand = '$expand=ausentismoDe,funcionario,tipoAusentismo($expand=claseAusentismo),diagnosticoCie';
    const url = `${environmentAlcanos.novedades}/odata/AusentismoFuncionarios/${id}?${expand}`;
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
 * @param dato 
 * @returns {Promise<any>}
 */
  public _editarArchivo(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/AusentismoFuncionarios/${dato.id}`, dato)
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
      this._httpClient.patch(`${environmentAlcanos.novedades}/api/ausentismoFuncionarios/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.novedades}/api/ausentismoFuncionarios`, dato)
        .subscribe((response: any) => {
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
    const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo' and (estado eq 'Incapacitado' or estado eq 'EnVacaciones' or estado eq 'Activo')`;
    const select = `$select=id,criterioBusqueda,estado`;
    const params = encodeURI(`${orderby}&${filter}&${select}&$count=true`);
    const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onFuncionariosCountChanged.next(response['@odata.count']);
        resolve(response.value);
      }, reject);
    });
  }

  // public getContratosFilter(value: any): Promise<any> {
  //   const filterCriterioBusqueda = `contains(funcionario/criterioBusqueda, '${value}')`;
  //   //const base = `$filter= and estado eq 'Vigente' and estadoRegistro eq 'Activo'`;
  //   const params = `$select=id,funcionarioId,estado,estadoRegistro&$expand=funcionario($select=criterioBusqueda,id)&$count=true&$filter=estado eq 'Vigente' and (${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`; 
  //   const url = `${environmentAlcanos.administracionPersonal}/odata/contratos?${params}`;
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.get(url).subscribe((response: any) => {
  //       resolve(response.value);
  //     }, reject);
  //   });
  // }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getDiagnosticos(filtro: string): Promise<any> {
    const filterNombre = `contains(nombre, '${filtro}')`;
    const filterCodigo = `contains(codigo, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const filter = `$filter=(${filterNombre} or ${filterCodigo}) and estadoRegistro eq 'Activo'`;
    const select = `$select=id,nombre,codigo`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.nomina}/odata/diagnosticoCies?${params}`;
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
  private _getClaseAusentismos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre`);
    const url = `${environmentAlcanos.novedades}/odata/claseAusentismos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onClaseAusentismosChanged.next(response.value);
        resolve();
      }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getTipoAusentismos(claseId: number): Promise<any> {
    const params = encodeURI(
      `$orderby=nombre&$filter=claseAusentismoId eq ${claseId} and estadoRegistro eq 'Activo'`
    );
    const url = `${environmentAlcanos.novedades}/odata/tipoAusentismos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }



  /**
   * 
   *
   * @returns {Promise<any>}
   */
  public getProrrogas(funcionarioId: number, claseAusentismoId: number, fecha: any): Promise<any> {
    const expand = encodeURI(
      '$expand=tipoAusentismo,diagnosticoCie'
    );
    const filter = encodeURI(
      `$filter=funcionarioId eq ${funcionarioId} and tipoAusentismo/claseAusentismoId eq ${claseAusentismoId} and fechaFin le ${fecha}`
    );
    const top = encodeURI(
      '$top=1'
    );
    const order = encodeURI(
      '$orderby=fechaInicio desc'
    );
    const url = `${environmentAlcanos.novedades}/odata/AusentismoFuncionarios?${expand}&${filter}&${top}&${order}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }


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


}

