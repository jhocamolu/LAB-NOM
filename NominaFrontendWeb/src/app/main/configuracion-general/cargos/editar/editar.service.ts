import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EditarService implements Resolve<any> {

  id: number;
  cargo: any[];
  onCargoChanged: BehaviorSubject<any>;
  onDataCargosReporta: BehaviorSubject<any[]>;
  onDataGradosReporta: BehaviorSubject<any[]>;
  onDependencias: BehaviorSubject<any[]>;
  onGrupos: BehaviorSubject<any[]>;
  onCargoPresupuestos: BehaviorSubject<any[]>;

  selectedTab: number;
  /**
   * 
   * @param  {HttpClient} _httpClient 
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    this.onCargoChanged = new BehaviorSubject({});
    this.onDataCargosReporta = new BehaviorSubject([]);
    this.onDataGradosReporta = new BehaviorSubject([]);
    this.onDependencias = new BehaviorSubject([]);
    this.onGrupos = new BehaviorSubject([]);
    this.onCargoPresupuestos = new BehaviorSubject([]);

    this.selectedTab = 0;
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

    if (route.queryParams.tab != null) {
      this.selectedTab = route.queryParams.tab;
    } else {
      this.selectedTab = 0;
    }

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCargo(this.id),
        this._getCargosReportas(this.id),
        this._getCargosGrados(this.id),
        this._getCargoDependencias(this.id),
        this._getCargoGrupos(this.id),
        this._getCargoPresupuestos(this.id)
      ]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  /**
   * 
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  private getCargo(id: number): Promise<any> {
    const params = encodeURI('$expand=nivelcargo');
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos/${id}?${params}`)
        .subscribe((response: any) => {
          this.cargo = response;
          this.onCargoChanged.next(this.cargo);
          resolve(response);
        }, reject);
    });
  }

  public getCargosReportas(): void {
    this._getCargosReportas(this.id);
  }

  /**
   * @param resolve
   * @id Id del Cargo
   * @returns {Promise<any>}
   * Obtiene Todas las Dependencias para llenar select asc Nombre
   * Versión 3 @darwingonzalez no lo borro porque el analisis estuvo complejo y puede requerirse en el futuro
   */
  // private _getCargosReportas(id: number): Promise<any> {
  //   // tslint:disable-next-line: max-line-length
  //   const params = encodeURI(`${environmentAlcanos.administracionPersonal}/odata/cargoReportas?$select=cargoDependenciaId,id,cargoJefeId,estadoRegistro&$expand=cargoJefe($select=id,nombre,codigo,clase,estadoRegistro),cargoDependencia($select=id,dependenciaId,cargoId,estadoRegistro;$expand=dependencia($select=id,codigo,nombre))&$filter=cargoDependencia/cargoId eq ${id} and cargoJefe/estadoRegistro ne 'Inactivo' and estadoRegistro eq 'Activo'`);
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoReportas?${params}`)
  //       .subscribe((response: any) => {
  //         this.onDataCargosReporta.next(response.value);
  //         resolve(response);
  //       }, reject);
  //   });
  // }

  // Version 4 
  private _getCargosReportas(id: number): Promise<any> {
    // tslint:disable-next-line: max-line-length
    const params = encodeURI(`$select=cargoDependenciaId,id,cargoDependenciaReportaId,estadoRegistro,jefeInmediato&$expand=cargoDependenciaReporta($select=id,cargoId,dependenciaId;$expand=cargo($select=id,nombre),dependencia($select=id,nombre)),cargoDependencia($select=id,dependenciaId,cargoId,estadoRegistro;$expand=dependencia($select=id,codigo,nombre),cargo($select=id,codigo,nombre))&$filter=cargoDependencia/cargoId eq ${id} and estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoReportas?${params}`)
        .subscribe((response: any) => {
          this.onDataCargosReporta.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  public getCargosGrados(): void {
    this._getCargosGrados(this.id);
  }

  /**
   * @param resolve 
   * @id Id del Cargo
   * @returns {Promise<any>}
   * Obtiene Todos los Grados para llenar select asc Nombre
   */
  private _getCargosGrados(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargo&$filter=cargoId eq ${id} and estadoRegistro ne 'Eliminado'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoGrados?${params}`)
        .subscribe((response: any) => {
          this.onDataGradosReporta.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  public getCargoDependencias(): void {
    this._getCargoDependencias(this.id);
  }

  /**
   * @param resolve 
   * @id Id del Cargo
   * @returns {Promise<any>}
   * Obtiene Todos las dependencias
   */
  private _getCargoDependencias(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargo,dependencia&$filter=cargoId eq ${id} and estadoRegistro ne 'Eliminado'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoDependencias?${params}`)
        .subscribe((response: any) => {
          this.onDependencias.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  public getCargoGrupos(): void {
    this._getCargoGrupos(this.id);
  }

  /**
   * @param resolve 
   * @id Id del Cargo
   * @returns {Promise<any>}
   * Obtiene Todos las dependencias
   */
  private _getCargoGrupos(id: number): Promise<any> {
    const params = encodeURI(`$expand=grupo&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoGrupos?${params}`)
        .subscribe((response: any) => {
          this.onGrupos.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  public getCargoPresupuestos(): void {
    this._getCargoPresupuestos(this.id);
  }

  /**
   * @param resolve 
   * @id Id del Cargo
   * @returns {Promise<any>}
   * Obtiene Todos las dependencias
   */
  private _getCargoPresupuestos(id: number): Promise<any> {
    const params = encodeURI(`$select=id,cargoId,annoVigenciaId,cantidad,estadoRegistro&$expand=annoVigencia($select=id,anno,estado,estadoRegistro)&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoPresupuestos?${params}`)
        .subscribe((response: any) => {
          this.onCargoPresupuestos.next(response.value);
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param id 
   * @param dato 
   * @returns {Promise<any>}
   */
  editar(id: number, dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/cargos/${id}`,
        dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  borrar(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/cargoReportas/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  borrarGrados(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/cargoGrados/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  // otro tipo de eliminar utilizando el body 
  borrarGrupos(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/CargoGrupos/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.request('delete', url, { body: { id: id } })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  borrarDependencias(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/CargoDependencias/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.delete(url)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param resolve 
   * @returns {Promise<any>}
   * Obtiene Todas los Nivel Cargos para llenar select asc Nombre
   */
  getNivelCargoLista(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/nivelcargos?$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * @param resolve 
   * @returns {Promise<any>}
   * Obtiene Todas las Grados para llenar select asc Nombre
   */
  getGradosLista(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoGrados?$expand=cargo&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * @param id 
   * @param activo 
   * @returns {Promise<any>}
   */
  activo(id: number, activo: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.administracionPersonal}/api/CargoGrados/${id}`, {
        id: id,
        activo: activo
      })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param id
   * @param dato
   * @returns {Promise<any>}
   */
  crearGrupo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/CargoGrupos`, { cargoId: this.id })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
