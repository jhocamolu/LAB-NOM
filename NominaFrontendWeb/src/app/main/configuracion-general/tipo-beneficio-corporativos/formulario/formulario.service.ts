
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


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

  selectedTab: number;

  // BehaviorSubject
  onItemChanged: BehaviorSubject<any>;

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

    if (route.queryParams.tab != null) {
      this.selectedTab = route.queryParams.tab;
    } else {
      this.selectedTab = 0;
    }

    
    this.onItemChanged = new BehaviorSubject(null);
    const promises = [];
    if (route.params.id != null) {
      this.id = route.params.id;
      promises.push(this.getTipoBeneficios(this.id));
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
  public getTipoBeneficios(id: number): Promise<any> {
    const uriParam = encodeURI('$expand=conceptonominadevengo,conceptoNominaDeduccion,conceptoNominaCalculo');
    const url = `${environmentAlcanos.administracionPersonal}/odata/tipobeneficios/${id}?${uriParam}`;
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
  public getConceptoNomina(clase: string): Promise<any> {
    const uriParam = encodeURI(`$filter=claseConceptoNomina eq '${clase}' and estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/conceptonominas?${uriParam}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  /**
   * 
   * @param id // Obtiene datos del cargo
   * @returns {Promise<any>}
   */
  public getRequisito(id: number): Promise<any> {
    const params = encodeURI(`$expand=tipoSoporte&$filter=tipoBeneficioId eq ${id}&$count=true`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tipobeneficiorequisitos?${params}`)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          resolve(response.value);
        }, reject);
    });
  }

  borrar(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/tipobeneficiorequisitos/${id}`;
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
      this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/tipobeneficios/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/tipobeneficios`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}