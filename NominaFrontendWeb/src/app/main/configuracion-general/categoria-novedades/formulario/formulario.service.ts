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

  constructor(
    private _httpClient: HttpClient
  ) {
    this.item = null;
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

    this.id = route.params.id;
    this.item = null;
    this.onItemChanged = new BehaviorSubject(null);

    const promises = [
    ];
    if (this.id != null) {
      promises.push(this._getCategoriaNovedades(this.id));
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
  private _getCategoriaNovedades(id: number): Promise<any> {
    const expand = '$expand=conceptoNomina($select=id,codigo,nombre)';
    const url = `${environmentAlcanos.novedades}/odata/CategoriaNovedades/${id}?${expand}`;
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
   * 
   * @returns {Promise<any>}
   */
  public getConceptos(filtro: string): Promise<any> {
    const filterCodigo = `contains(codigo, '${filtro}')`;
    const filterNombre = `contains(nombre, '${filtro}')`;
    const orderby = `$orderby=nombre`;
    const filter = `$filter=(${filterCodigo} or ${filterNombre}) and estadoRegistro eq 'Activo' and tipoConceptoNomina eq 'Novedad'`;
    const select = `$select=id,codigo,nombre`;
    const params = encodeURI(`${orderby}&${filter}&${select}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/conceptoNominas?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
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
      this._httpClient.put(`${environmentAlcanos.novedades}/api/CategoriaNovedades/${id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.novedades}/api/CategoriaNovedades`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
