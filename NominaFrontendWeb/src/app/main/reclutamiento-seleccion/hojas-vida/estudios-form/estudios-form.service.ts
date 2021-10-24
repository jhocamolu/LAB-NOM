import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class EstudiosService implements Resolve<any>{

  itemFuncionario: any;
  onItemFuncionarioChanged: BehaviorSubject<any>;

  itemEstudio: any | null;
  onItemEstudioChanged: BehaviorSubject<any>;

  //
  estadoEstudios: any[];
  onNivelEducativosChanged: BehaviorSubject<any[]>;
  onPaisesChanged: BehaviorSubject<any[]>;
  onProfesionesChanged: BehaviorSubject<any[]>;



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
    this.onItemEstudioChanged = new BehaviorSubject(null);

    this.onPaisesChanged = new BehaviorSubject([]);
    this.onNivelEducativosChanged = new BehaviorSubject([]);
    this.onProfesionesChanged = new BehaviorSubject([]);

    this.estadoEstudios = [
      {
        id: 'EnCurso',
        nombre: 'En curso',
        fechaFinalEnabled: false
      },
      {
        id: 'Aplazado',
        nombre: 'Aplazado',
        fechaFinalEnabled: false
      },
      {
        id: 'Abandonado',
        nombre: 'Abandonado',
        fechaFinalEnabled: false
      },
      {
        id: 'Culminado',
        nombre: 'Culminado',
        fechaFinalEnabled: true
      }
    ];
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
    this.itemEstudio = null;
    this.onItemEstudioChanged = new BehaviorSubject(null);

    const promises = [
      this.getAspirante(route.params.id),
      this.getPaises(),
      this.getNivelEducativos(),
      this.getProfesiones()
    ];
    if (route.params.estudioId != null) {
      promises.push(this.getEstudio(route.params.estudioId));
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
    const params =`$expand=tipoDocumento,TipoSangre,sexo,ocupacion`;
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
  private getEstudio(id: number): Promise<any> {
    const params =
      `$expand=profesion`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/HojaDeVidaEstudios/${id}?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.itemEstudio = response;
        this.onItemEstudioChanged.next(this.itemEstudio);
        resolve(response);
      }, reject);
    });
  }



  /**
   * 
   * @returns {Promise<any>}
   */
  private getNivelEducativos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/nivelEducativos?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onNivelEducativosChanged.next(response.value);
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
   * @returns {Promise<any>}
   */
  private getProfesiones(): Promise<any> {
    const params = encodeURI(`$orderby=nombre&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/profesiones?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onProfesionesChanged.next(response.value);
        resolve(response);
      }, reject);
    });
  }





  /**
   * @param dato 
   * @returns {Promise<any>}
   */
  public upsert(dato: any): Promise<any> {
    if (this.itemEstudio != null && this.itemEstudio.id != null) {
      return this._editar(this.itemEstudio.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/HojaDeVidaEstudios/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/HojaDeVidaEstudios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



}
