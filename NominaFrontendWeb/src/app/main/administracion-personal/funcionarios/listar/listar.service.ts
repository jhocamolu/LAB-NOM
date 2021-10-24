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
                  case 'estado':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`estado`)} eq '${decodeURIComponent(value)}'`);
                     break;
                  case 'centroOperativo':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`contrato/centroOperativo/id`)} eq ${decodeURIComponent(value)} or ${decodeURIComponent(`contratoOtroSi/centroOperativo/id`)} eq ${decodeURIComponent(value)}`);
                     break;
                  case 'cargo':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`contrato/cargoDependencia/id`)} eq ${decodeURIComponent(value)} or ${decodeURIComponent(`contratoOtroSi/cargoDependencia/id`)} eq ${decodeURIComponent(value)}`);
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
      const urlEncode = encodeURI(`$select=id,primerNombre,primerApellido,numeroDocumento,adjunto,estado&$expand=contrato($select=estado;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=id,cargoId;$expand=cargo($select=nombre))),ContratoOtroSi($select=fechaAplicacion;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=cargoId;$expand=cargo($select=nombre),dependencia($select=nombre,codigo)))`);
      const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales?${urlEncode}&$count=true&${toUrlEncoded(params)}`;
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
    * Obtiene Todos los tipo periodos para llenar select asc Nombre
    */
   getCentroOperativosList(): Promise<any> {
      const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/centroOperativos?${params}`)
            .subscribe((response: any) => {
               resolve(response.value);
            }, reject);
      });
   }

   /**
    * @param resolve 
    * @returns {Promise<any>}
    * Obtiene Todos los tipo periodos para llenar select asc Nombre
    */
   getCargoEmpleadosList(): Promise<any> {
      const params = encodeURI(`$expand=cargo&$filter=cargo/estadoRegistro eq 'Activo'&$orderby=cargo/nombre asc`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoDependencias?${params}`)
            .subscribe((response: any) => {
               resolve(response.value);
            }, reject);
      });
   }


}
