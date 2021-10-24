import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class PrenominaService implements Resolve<any> {

  id: number;
  item: any;
  onItemChange: BehaviorSubject<any>;

  //
  totalCount: number;

  prenomina: any[];
  onPrenominaChange: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

  // filtros modal
  centroOperativos: any[];
  cargos: any[];

  action: string;


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
    this.onPrenominaChange = new BehaviorSubject([]);
    this.dataRequest = new BehaviorSubject(false);

    this.prenomina = [];
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
    this.action = route.queryParams.action;
    const promises = [
      this._getCentroOperativos(),
      this._getCargos(),
      this.getNomina(),
      this.getPrenominas(),
    ];
    this.item = null;
    this.onPrenominaChange.next([]);
    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        () => {
          resolve();
        },
        reject
      );
    });

  }


  public refreshData(): Promise<any> {
    return new Promise((resolve, reject) => {
      Promise.all([this.getNomina(), this.getPrenominas()]).then(
        () => {
          resolve();
        },
        reject
      );
    });
  }

  public getNomina(): Promise<any> {
    return this._getNomina(this.id);
  }

  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/api/nominas/NominaCabecera/${id}?`)
        .subscribe((response: any) => {
          this.item = response;
          this.onItemChange.next(response);
          resolve();
        }, reject);
    });
  }



  public getPrenominas(): Promise<any> {
    return this._getPrenominas(this.id);
  }

  /**
   * @param id 
   * @returns {Promise<any>}
   */
  public getIdNomina(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   *
   * @returns {Promise<any>}
   */
  private _getPrenominas(id: number): Promise<any> {
    const url = `${environmentAlcanos.nomina}/odata/GetNominaFuncionarioDatoActuales(NominaId=${id})?$count=true`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          // this.prenomina = response;
          this.totalCount = response['@odata.count'];
          this.prenomina = response.value;
          this.onPrenominaChange.next(this.prenomina);
          this.dataRequest.next(false);
          resolve(response);
        }, reject);
    });
  }


  /**
   * @param datos
   * @returns {Promise<any>}
   * Calcular prenomina
   */
  public calcular(datos: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/nominafuncionarios/iniciar`, datos)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  /**
   * @param dato 
   * @returns {Promise<any>}
   * Finalizar prenomina
   */
  public finalizar(dato: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.patch(`${environmentAlcanos.nomina}/api/nominafuncionarios/finalizar`, dato)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }



  /**
   * filtro centro operativo
   * 
   * @returns {Promise<any>}
   */
  private _getCentroOperativos(): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo'&$orderby=nombre`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/centroOperativos?${params}`)
        .subscribe((response: any) => {
          this.centroOperativos = response.value;
          resolve();
        }, reject);
    });
  }

  /**
   * filtro cargo
   * 
   * @returns {Promise<any>}
   */
  private _getCargos(): Promise<any> {
    const params = encodeURI(
      `$filter=estadoRegistro eq 'Activo'&$orderby=nombre&$select=id,nombre,codigo`
    );
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.nomina}/odata/cargos?${params}`)
        .subscribe((response: any) => {
          this.cargos = response.value;
          resolve();
        }, reject);
    });
  }

}
