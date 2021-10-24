import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable()
export class DashboardService implements Resolve<any>
{
    onFilterChanged: Subject<any>;
    onFilterSubChanged: Subject<any>;
    onBlockChanged: Subject<any>;

    private item = new BehaviorSubject('');
    itemChange = this.item.asObservable();

    filterBy: string;
    filterSubBy: string;
    blockMenu: any;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the defaults
        this.onFilterChanged = new Subject();
        this.onFilterSubChanged = new Subject();
        this.onBlockChanged = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {
            const promises = [

            ];
            Promise.all(promises).then(
                () => {
                    this.onFilterChanged.subscribe(filter => {
                        if (filter) {
                            this.filterBy = filter;
                        }
                    });
                    this.onFilterSubChanged.subscribe(filter => {
                        if (filter) {
                            this.filterSubBy = filter;
                        }
                    });
                    this.onBlockChanged.subscribe(filter => {
                        if (filter) {
                            this.blockMenu = filter;
                        }
                    });
                    resolve();
                },
                reject
            );
        });
    }

    nextItem(item: any) {
        this.item.next(item)
      }
    
      public _getAspirante(numerdoDocumento: number): Promise<any> {
        const params =
          // tslint:disable-next-line: max-line-length
          `?$expand=tipoDocumento,sexo,EstadoCivil,Ocupacion,divisionPoliticaNivel2Origen($expand=divisionPoliticaNivel1($expand=pais)),divisionPoliticaNivel2ExpedicionDocumento($expand=divisionPoliticaNivel1),divisionPoliticaNivel2Residencia($expand=divisionPoliticaNivel1($expand=pais)),TipoVivienda,ClaseLibretaMilitar,LicenciaConduccionA,LicenciaConduccionB,LicenciaConduccionC,TipoSangre`;
        const url = `${environmentAlcanos.portal}/odata/Custom/_HojaDeVidas/${params}&$filter= numeroDocumento  eq '${numerdoDocumento}'`;
        return new Promise((resolve, reject) => {
          this._httpClient.get(url).subscribe((response: any) => {
            resolve(response);
          }, reject);
        });
      }
}

