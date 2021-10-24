import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ActividadesListarService {

  id: any;
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  onActividadChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;
  funcionario: any;
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
    this.dataFilters = {};
    this.items = [];
    this.onItemsChanged = new BehaviorSubject({});
    this.onActividadChanged = new BehaviorSubject({});
    this.dataRequest = new BehaviorSubject(false);
  }

  public init(id: number): void {
    this.id = id;
    this.buildFilter({});
  }

  public buildFilter(filters): Promise<any> {
    this.urlFilters = JSON.parse(JSON.stringify(filters));
    this.dataFilters = {};
    if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }
    if (this.urlFilters.hasOwnProperty('$filter')) {

      const dataFilters = {};
      const urlFilters = [];
      this.urlFilters['$filter'].replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
        switch (decodeURIComponent(key)) {
          case 'actividad':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`actividad/nombre`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
          case 'codigoActividad':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(`actividad/codigo`)} , 'Edm.String'),'${decodeURIComponent(value)}')`);
            }
            break;
          case 'fechaInicio':
            if (decodeURIComponent(value) != 'null') {
              const dateIn = new Date(decodeURIComponent(value));
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaInicio eq ${String(dateIn.getFullYear() + '-' + (dateIn.getMonth() + 1) + '-' + dateIn.getDate())}`);
            }
            break;
          case 'fechaFinalizacion':
            if (decodeURIComponent(value) != 'null') {
              const dateFin = new Date(decodeURIComponent(value));
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaFinalizacion eq ${String(dateFin.getFullYear() + '-' + (dateFin.getMonth() + 1) + '-' + dateFin.getDate())}`);
            }
            break;

          case 'fechaMixta':
            const data = String(decodeURIComponent(value)).split(',');
            if (decodeURIComponent(value) != 'null') {
              const dateIn = new Date(decodeURIComponent(data[0]));
              const dateOut = new Date(decodeURIComponent(data[1]));
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`fechaInicio ge ${String(dateIn.getFullYear() + '-' + (dateIn.getMonth() + 1) + '-' + dateIn.getDate())}`);
              urlFilters.push(`fechaFinalizacion le ${String(dateOut.getFullYear() + '-' + (dateOut.getMonth() + 1) + '-' + dateOut.getDate())}`);
            }
            break;
          case 'municipio':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`municipio/id`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          case 'cantidad':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`cantidad`)} eq ${decodeURIComponent(value)}`);
            }
            break;
          case 'estado':
            if (value !== 'null') {
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
            }
            break;
        }
      });
      urlFilters.push(`${decodeURIComponent(`funcionarioId`)} eq ${decodeURIComponent(this.id)}`);
      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;

    }

    // ordenar asc y desc en segundo nivel //
    if (this.urlFilters.hasOwnProperty('$orderBy')) {
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'actividad/nombre asc') {
        this.urlFilters.$orderBy = 'actividad/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'actividad/nombre desc') {
        this.urlFilters.$orderBy = 'actividad/nombre desc';
      }

      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'municipio/nombre asc') {
        this.urlFilters.$orderBy = 'municipio/nombre asc';
      }
      if (this.urlFilters.hasOwnProperty('$orderBy') && this.urlFilters.$orderBy === 'municipio/nombre desc') {
        this.urlFilters.$orderBy = 'municipio/nombre desc';
      }
    }

    if (!this.urlFilters.hasOwnProperty('$orderBy')) {
      this.urlFilters.$orderBy === 'fechaInicio desc';
    }
    return this._getActividadesFuncionario(this.urlFilters);
  }

  private _getActividadesFuncionario(params: any): Promise<any> {
    this.getActividad();
    let filter = '';
    if (!params.hasOwnProperty('$filter')) {
      filter = `$filter=funcionarioId eq ${this.id}`;
    }
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const element = `$expand=actividad($select=id,nombre,codigo),funcionario($select=id,primerNombre),municipio($select=id,nombre)`;
    const url = `${environmentAlcanos.configuracionGeneral}/odata/ActividadFuncionarios?$count=true&${filter}&${element}&${toUrlEncoded(params)}`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.dataRequest.next(false);
          resolve(response);
        }, reject);
    });
  }

  /**
   * 
   * @returns {Promise<any>}
   */
  private getActividad(): Promise<any> {
    const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/actividades?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.onActividadChanged.next(response.value);
        resolve();
      }, reject);
    });
  }


  /**
   * 
   * @returns {Promise<any>}
   */
  public getActividadSolo(id: number): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/odata/actividades/${id}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  /**
   * 
   * @param departamentoId 
   * @returns {Promise<any>}
   */
  public getMunicipios(): Promise<any> {
    const params = encodeURI(`$filter=estadoRegistro eq 'Activo'&$orderby=nombre`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/divisionPoliticaNiveles2?${params}`;
    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        resolve(response.value);
      }, reject);
    });
  }

}



