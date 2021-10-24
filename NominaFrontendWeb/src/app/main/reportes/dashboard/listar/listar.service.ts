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
   alias: string;
   items: any[];
   onItemsChanged: BehaviorSubject<any>;
   onCategoryChanged: BehaviorSubject<any>;
   dataRequest: BehaviorSubject<boolean>;
   top: number;


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
      this.onCategoryChanged = new BehaviorSubject([]);
      this.dataRequest = new BehaviorSubject(false);
   }

   /**
    * Resolver
    *
    * @param {ActivatedRouteSnapshot} route
    * @param {RouterStateSnapshot} state
    * @returns {Observable<any> | Promise<any> | any}
    */
   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
      this.alias = route.params.alias;
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
            if (decodeURIComponent(value) !== 'null' && decodeURIComponent(value) !== 'undefined') {
               switch (decodeURIComponent(key)) {
                  case 'categoria':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`subcategoria/id`)} eq ${decodeURIComponent(value)}`);
                     break;
                  case 'reporte':
                     dataFilters[decodeURIComponent(key)] = decodeURIComponent(value);
                     urlFilters.push(`${decodeURIComponent(`alias`)} eq '${decodeURIComponent(value)}'`);
                     break;
               }
            }

         });
         this.dataFilters = dataFilters;
         this.urlFilters['$filter'] = urlFilters.length > 0 ? urlFilters.join(' and ') : true;
      }

      return new Promise((resolve, reject) => {


         Promise.all([
            this.getReportes(this.urlFilters, route.params.alias),
            this.getCategorias(route.params.alias)
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
   public getReportes(params: any, alias: string): Promise<any> {
      let filter = '';
      if (!params.hasOwnProperty('$filter')) {
         filter = encodeURI(`$filter=subcategoria/categoria/alias eq '${alias}'`);
      }
      if (params.$filter == true) {
         params.$filter = `subcategoria/categoria/alias eq '${alias}'`;
      }

      const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
      const urlEncode = encodeURI(`$expand=Subcategoria($expand=categoria)&$select=vistaGeneracion,alias,nombre,descripcion,subcategoria,esmodal,extension&$count=true`);
      const url = `${environmentAlcanos.reportes}/odata/VistaFrontendReportes?${urlEncode}&${filter}&${toUrlEncoded(params)}`;
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
    *
    * @returns {Promise<any>}
    */
   public getReporte(value: any, alias: string): Promise<any> {
      const params = encodeURI(`$filter=subcategoria/categoria/alias eq '${alias}' and subcategoriaId eq ${value}`);
      const url = `${environmentAlcanos.reportes}/odata/VistaFrontendReportes?${params}`;
      this.dataRequest.next(true);
      return new Promise((resolve, reject) => {
         this._httpClient.get(url)
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
   getCategorias(alias: string): Promise<any> {
      const params = encodeURI(`$filter=alias eq '${alias}'&$top=1`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.reportes}/odata/categorias?${params}`)
            .subscribe((response: any) => {
               this.onCategoryChanged.next(response.value);
               resolve();
            }, reject);
      });
   }

   /**
    * @param resolve 
    *  @returns {Promise<any>}
    * Obtiene Todos llas subcategorias para llenar select asc Nombre
    */
   getSubcategoriaCategorias(categoria: any): Promise<any> {
      const params = encodeURI(`$expand=categoria&$filter=categoria/alias eq '${categoria}'`);
      return new Promise((resolve, reject) => {
         this._httpClient.get(`${environmentAlcanos.reportes}/odata/Subcategorias?${params}`)
            .subscribe((response: any) => {
               resolve(response.value);
            }, reject);
      });
   }

}
