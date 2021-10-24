import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class ListarEditarService {
  id: any;
  totalCount: number;
  urlFilters: any;
  page: number;
  dataFilters: any;
  items: any[];
  onItemsChanged: BehaviorSubject<any>;
  dataRequest: BehaviorSubject<boolean>;

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
       
        if (value !== 'null') {
        if (decodeURIComponent(value) !== 'null') {
          switch (decodeURIComponent(key)) {
            case 'primerNombre':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionario/primerNombre`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'primerApellido':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionario/primerApellido`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'tipoDocumentoId':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`funcionario/tipoDocumentoId`)} eq ${decodeURIComponent(value)}`);
              break;
            case 'numeroDocumento':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(${decodeURIComponent(`funcionario/numeroDocumento`)}, '${decodeURIComponent(value)}')`);
              break;
            case 'estado':
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
              break;
            default:
              dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
              urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
              break;
          }
          //urlFilters.push(`${decodeURIComponent(`notificacionId`)} eq ${decodeURIComponent(this.id)}`);
        }
      }
      });

      this.dataFilters = dataFilters;
      this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
      this.urlFilters['$filter'] = this.urlFilters['$filter'] === true ? `notificacionId eq ${this.id}` : `${this.urlFilters['$filter']} and notificacionId eq ${this.id}`;
    }else{
      this.urlFilters['$filter'] =   `notificacionId eq ${this.id}`;
    }

    return this._getDestinatarios(this.urlFilters);
  }

  public getDestinatarios(): Promise<any> {
    return this._getDestinatarios(this.urlFilters);
  }

  
  private _getDestinatarios(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const param = encodeURI(`$expand=funcionario,notificacion&$count=true`);
    const url = `${environmentAlcanos.administracionPersonal}/odata/NotificacionDestinatarios?${param}&${toUrlEncoded(params)}`;
    this.dataRequest.next(true);
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.items = response.value;
          this.onItemsChanged.next(this.items);
          this.dataRequest.next(false);
          resolve();
        }, reject);
    });
  }

  public getTipoDocumentosList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/tipoDocumentos`)
        .subscribe((response: any) => {
          resolve(response.value);
        }, reject);
    });
  }

  borrar(data: any): Promise<any> {
    const url = `${environmentAlcanos.administracionPersonal}/api/NotificacionDestinatarios/${data.id}`;
    return new Promise((resolve, reject) => {
        this._httpClient.delete(url)
            .subscribe((response: any) => {
                resolve(response);
            }, reject);
    });
}

   

}



