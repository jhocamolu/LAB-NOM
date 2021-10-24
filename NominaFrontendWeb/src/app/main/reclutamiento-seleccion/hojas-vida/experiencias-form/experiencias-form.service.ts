import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ExperienciasService implements Resolve<any>{

  itemFuncionario: any;
  onItemFuncionarioChanged: BehaviorSubject<any>;

  itemExperiencia: any | null;
  onItemExperienciaChanged: BehaviorSubject<any>;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.onItemFuncionarioChanged = new BehaviorSubject({});
    this.onItemExperienciaChanged = new BehaviorSubject(null);

  }


  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    this.onItemFuncionarioChanged = new BehaviorSubject({});
    this.itemExperiencia = null;
    this.onItemExperienciaChanged = new BehaviorSubject(null);
    const promises = [
      this.getAspirante(route.params.id),
    ];
    if (route.params.experienciaId != null) {
      promises.push(this.getExperiencia(route.params.experienciaId));
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
  private getAspirante(id: number): Promise<any> {
    const params = `$expand=tipoDocumento,TipoSangre,sexo,ocupacion`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/HojaDeVidas/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.itemFuncionario = response;
        this.onItemFuncionarioChanged.next(this.itemFuncionario);
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private getExperiencia(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/HojaDeVidaExperienciaLaborales/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.itemExperiencia = response;
        this.onItemExperienciaChanged.next(this.itemExperiencia);
        resolve(response);
      }, reject);
    });
  }


  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.itemExperiencia != null && this.itemExperiencia.id != null) {
      return this._editar(this.itemExperiencia.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/HojaDeVidaExperienciaLaborales/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/HojaDeVidaExperienciaLaborales`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
