import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class AutorizadoresFormularioService {

  id: any | null;
  item: any | null;

  /**
   *
   * @param  {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
  }

  /**
     * 
     *
     * @returns {Promise<any>}
     */
  public getAplicacionExternaCargos(id: number): Promise<any> {
    const expand = '$expand=centroOperativoDependiente,cargoDependenciaIndependiente($expand=cargo,dependencia),centroOperativoIndependiente';
    const url = `${environmentAlcanos.configuracionGeneral}/odata/AplicacionExternaCargos/${id}?${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.item = response;
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
    if (this.item != null && dato.id != null) {
      return this.editar(dato.id, dato);
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
      this._httpClient.put(`${environmentAlcanos.nomina}/api/AplicacionExternaCargos/${dato.id}`, dato)
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
      this._httpClient.post(`${environmentAlcanos.nomina}/api/AplicacionExternaCargos`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getDependencias(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const expand = `$select=id,codigo,nombre,estadoRegistro`
    const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}&${expand}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  // POr ahora se utiliza el odata cargodependencias
  // public getCargos(filtro: string): Promise<any> {
  //   const filterCodigo = `contains(codigo, '${filtro}')`;
  //   const filterNombre = `contains(nombre, '${filtro}')`;
  //   const orderby = `$orderby=nombre`;
  //   const filter = `$filter=(${filterCodigo} or ${filterNombre}) and estadoRegistro eq 'Activo'`;
  //   const select = `$select=id,codigo,nombre,clase`;
  //   const params = encodeURI(`${orderby}&${filter}&${select}`);
  //   const url = `${environmentAlcanos.administracionPersonal}/odata/Cargos?${params}`;
  //   return new Promise((resolve, reject) => {
  //     this._httpClient.get(url).subscribe((response: any) => {
  //       resolve(response.value);
  //     }, reject);
  //   });
  // }

  public getCargos(filtro: string,id:number): Promise<any> {
    const filterCodigo = `contains(cargo/codigo, '${filtro}')`;
    const filterNombre = `contains(cargo/nombre, '${filtro}')`;
    const orderby = `$orderby=cargo/nombre`;
    const filter = `$filter=(${filterCodigo} or ${filterNombre}) and estadoRegistro eq 'Activo' and dependenciaId eq ${id}`;
    const expand = `$expand=cargo`;
    const select = `$select=id,codigo,nombre,clase`;
    const params = encodeURI(`${orderby}&${filter}&${expand}(${select})`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/cargoDependencias?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }


  public getCargoReportasSolo(id: number): Promise<any> {
    const select = `$select=cargoJefeId`;
    const url = `${environmentAlcanos.administracionPersonal}/odata/CargoReportas/${id}?${select}`;
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
  public getCentroOperativos(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/centroOperativos?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * Listar los cargo dependiente
   * @returns {Promise<any>}
   */
  public getCargoDependencia(id: number): Promise<any> {
    const params = encodeURI(`$expand=cargoDependenciaReporta($expand=cargo),cargoDependencia($expand=cargo,dependencia)&$filter=estadoRegistro eq 'Activo' and cargoDependenciaReportaId eq ${id}`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/CargoReportas?${params}`;
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
  public getCargoDependenciaEdit(id: number,tipo:string): Promise<any> {
    const params = encodeURI(`$filter=aplicacionExternaCargoId eq ${id}&$expand=cargoDependencia($select=id,dependenciaId,cargoId;$expand=cargo)&$select=aplicacionExternaCargoId,cargoDependenciaId,id`);
    const filter = encodeURI(`$filter=estadoRegistro eq 'Activo' and tipo eq ${tipo}`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/AplicacionExternaCargoDependientes?${params}`)
        .subscribe((response: any) => {
          const ids = [];
          response.value.forEach(element => {
            ids.push(element.cargoDependienteId);
          });
          resolve(response.value);
        }, reject);
    });
  }


}
