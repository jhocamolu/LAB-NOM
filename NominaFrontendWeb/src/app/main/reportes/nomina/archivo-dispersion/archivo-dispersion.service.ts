import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from '../../../../../environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ArchivoDispersionService {

  id: number;
  item: any;
  alias: string;
  onItemChange: BehaviorSubject<any>;

  dataRequest: BehaviorSubject<boolean>;
  urlFilters: any;

  dataFilters: any;
  //
  totalCount: number;

  infoData: any[];
  onArchivoDispersionChange: BehaviorSubject<any>;
  onEntidadFinancieraChange: BehaviorSubject<any>;

  action: string;
  loadComponent: BehaviorSubject<boolean>;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(
    private _httpClient: HttpClient
  ) {
    // Set the defaults
    this.totalCount = 0;
    this.onItemChange = new BehaviorSubject({});
    this.onArchivoDispersionChange = new BehaviorSubject([]);
    this.onEntidadFinancieraChange = new BehaviorSubject([]);
    this.dataRequest = new BehaviorSubject(false);
    this.dataFilters = {};
    this.dataRequest = new BehaviorSubject(false);
    this.infoData = [];
    this.loadComponent = new BehaviorSubject(false);
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getEntidadFinancieras(): Promise<any> {
    const params = encodeURI(`$select=id,codigo,nombre,entidadPorDefecto&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/entidadFinancieras?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  public getCuentaBancarias(id: number): Promise<any> {
    const params = encodeURI(`$select=id,numero,nombre,entidadFinancieraId&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo' and entidadFinancieraId eq ${id}`);
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/cuentaBancarias?${params}`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  public _getNominaValorTotal(fecha1, fecha2): Promise<any> {
    let params;
    params = encodeURI(`(FechaInicial=${fecha1},FechaFinal=${fecha2})`);

    const url = `${environmentAlcanos.nomina}/odata/GetNominaValorTotal${params}`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response.length;
          this.infoData = response;
          this.onArchivoDispersionChange.next(this.infoData);
          this.dataRequest.next(false);
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @param dato 
   * @returns {Promise<any>}
   */
  crear(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post(`${environmentAlcanos.administracionPersonal}/reporte/ArchivoDispersion`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

}
