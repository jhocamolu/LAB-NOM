import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
  providedIn: 'root'
})
export class AsociadosService {

  conceptoId: number;
  conceptoAgrupador: boolean;


  page: number;
  urlFilters: any;
  totalCount: number;
  original: any[];
  items: any[];
  onItemsChanged: BehaviorSubject<any[]>;
  dataRequest: BehaviorSubject<boolean>;


  constructor(
    private _httpClient: HttpClient
  ) {
    this.totalCount = 0;
    this.urlFilters = {};
    this.onItemsChanged = new BehaviorSubject([]);
    this.dataRequest = new BehaviorSubject(false);
    this.items = [];
    this.original = [];
  }

  public init(conceptoId, conceptoAgrupador): void {
    this.conceptoId = conceptoId;
    this.conceptoAgrupador = conceptoAgrupador;
    this.buildFilter({});
  }

  public buildFilter(filters): Promise<any> {
    this.urlFilters = JSON.parse(JSON.stringify(filters));
    if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
      this.page = 0;
      this.urlFilters['$top'] = 5;
      this.urlFilters['$skip'] = 0;
    } else {
      this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
    }

    this.urlFilters.$filter = `conceptoNominaId eq ${this.conceptoId} and estadoRegistro eq 'Activo'`;
    if (this.conceptoAgrupador) {
      this.urlFilters.$filter = `conceptoNominaAgrupadorId eq ${this.conceptoId} and estadoRegistro eq 'Activo'`;

    }
    this.urlFilters.$orderBy = 'conceptoNomina/nombre,conceptoNominaAgrupador/nombre';

    return this._getItemAsociadas(this.urlFilters);
  }



  /**
   * 
   * @param id 
   * @returns {Promise<any>}
   */
  private _getItemAsociadas(params: any): Promise<any> {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    const url = `${environmentAlcanos.nomina}/odata/conceptobases?$count=true&$expand=conceptoNomina($select=id,codigo,nombre),conceptoNominaAgrupador($select=id,codigo,nombre)&$select=id,conceptoNomina,conceptoNominaAgrupador,conceptoNominaId,conceptoNominaAgrupadorId&${toUrlEncoded(params)}`;
  
    return new Promise((resolve, reject) => {
      this._httpClient.get(url)
        .subscribe((response: any) => {
          this.totalCount = response['@odata.count'];
          this.original = response.value;
          this.items = [];
          this.original.forEach(element => {
            this.items.push({
              id: element.id,
              asociado: this.conceptoAgrupador ? element.conceptoNomina : element.conceptoNominaAgrupador
            });
          });
          this.onItemsChanged.next(this.items);
          resolve(response.value);
        }, reject);
    });
  }
}
