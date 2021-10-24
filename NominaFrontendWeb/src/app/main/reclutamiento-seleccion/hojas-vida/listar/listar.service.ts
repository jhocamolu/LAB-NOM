import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
   providedIn: 'root'
})
export class ListarService implements Resolve<any>{

   totalCount: number;
   urlFilters: any;

   dataFilters: any;

   items: any[];
   onItemsChanged: BehaviorSubject<any>;
   dataRequest: BehaviorSubject<boolean>;
   top: number;

   onEstadoEmpleadosChange: BehaviorSubject<any[]>;
   onCentroOperativosChange: BehaviorSubject<any[]>;
   onCargoEmpleadosChange: BehaviorSubject<any[]>;

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
      this.top = 48;
      this.dataFilters = {};
      this.onItemsChanged = new BehaviorSubject([]);
      this.dataRequest = new BehaviorSubject(false);

      this.onEstadoEmpleadosChange = new BehaviorSubject([]);
      this.onCentroOperativosChange = new BehaviorSubject([]);
      this.onCargoEmpleadosChange = new BehaviorSubject([]);
   }

   /**
    * Resolver
    *
    * @param {ActivatedRouteSnapshot} route
    * @param {RouterStateSnapshot} state
    * @returns {Observable<any> | Promise<any> | any}
    */
   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
      this.urlFilters = JSON.parse(JSON.stringify(route.queryParams));
      this.urlFilters['$skip'] = 0;
      if (this.urlFilters.hasOwnProperty('$top') === false) {
         this.urlFilters['$top'] = this.top;
         this.dataFilters = {};
      } else {
         this.top = parseInt(this.urlFilters['$top']);
      }
      if (this.urlFilters.hasOwnProperty('$filter')) {
         const dataFilters = {};
         const urlFilters = [];
         this.urlFilters.$filter.replace(/([^=&]+)=([^&]*)/g, function (m, key, value) {
            if (decodeURIComponent(value) !== 'null') {
               switch (decodeURIComponent(key)) {
                  case 'ocupacion':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`ocupacion/id`)} eq ${decodeURIComponent(value)}`);
                     break;
                  case 'genero':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`sexo/id`)} eq ${decodeURIComponent(value)}`);
                     break;
                  default:
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`contains(cast(${decodeURIComponent(key)}, 'Edm.String'),'${decodeURIComponent(value)}')`);
                     break;

               }
            }

         });
         this.dataFilters = dataFilters;
         this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
      }

      return new Promise((resolve, reject) => {
         Promise.all([
            this.getFuncionarios(this.urlFilters)
         ]).then(
            () => {
               resolve();
            },
            reject
         );
      });
   }

   /**
    * 
    *
    * @returns {Promise<any>}
    */
   public getFuncionarios(params: any): Promise<any> {
      const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
      // tslint:disable-next-line: max-line-length
      const urlEncode = encodeURI(`$expand=sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),tipoDocumento,divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,TipoSangre,licenciaConduccionA,licenciaConduccionB,licenciaConduccionC`);
      const url = `${environmentAlcanos.configuracionGeneral}/odata/HojaDeVidas?${urlEncode}&$count=true&${toUrlEncoded(params)}`;
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
    * @param resolve 
    * @returns {Promise<any>}
    * 
    */
   getOcupacionesList(): Promise<any> {
      const params = encodeURI(`$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc&$select=id,codigo,nombre`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/ocupaciones?${params}`)
            .subscribe((response: any) => {
               resolve(response.value);
            }, reject);
      });
   }

   /**
    * 
    * @returns {Promise<any>}
    */
   getGenerosList(): Promise<any> {
      const params = encodeURI(`$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc&$select=id,nombre`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/sexos?${params}`)
            .subscribe((response: any) => {
               resolve(response.value);
            }, reject);
      });
   }


}
