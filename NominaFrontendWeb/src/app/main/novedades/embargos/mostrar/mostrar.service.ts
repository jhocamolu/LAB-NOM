
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
    providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

    id: number | null;
    item: any | null;
    changed: any;


    // BehaviorSubject
    onItemChanged: BehaviorSubject<any>;
    onConceptoChanged: BehaviorSubject<any>;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the defaults
        this.onItemChanged = new BehaviorSubject(null);
        this.onConceptoChanged = new BehaviorSubject(null);
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

    return new Promise((resolve, reject) => {
      Promise.all([
        this._getEmbargos(this.id),
        this.getEmbargoConceptoNominasId(this.id)
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
     * @param id 
     * @returns {Promise<any>}
     */
    public _getEmbargos(id: number): Promise<any> {
        const params = encodeURI(
            `$expand=funcionario,juzgado,tipoEmbargo,entidadFinanciera,EmbargosUbperiodos($expand=subPeriodo($expand=tipoPeriodo))`
        );
        const url = `${environmentAlcanos.novedades}/odata/embargos/${id}?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.item = response;
                this.onItemChanged.next(this.item);
                resolve(response);
            }, reject);
        });
    }

    public getEmbargoConceptoNominasId(id: number): Promise<any> {
        const param = encodeURI(`$filter=embargoId eq ${id}&$count=true&$expand=conceptonomina($select=nombre,id)`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/embargoconceptonominas?${param}`)
                .subscribe((response: any) => {
                    this.onConceptoChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    public getEmbargoPeriodoLiquidacion(id: number): Promise<any> {
        const params = encodeURI(`$select=id&$expand=nominaFuenteNovedad($select=id,moduloRegistroId,modulo)&$filter=Estado eq 'Pendiente' and nominaFuenteNovedad/moduloRegistroId eq ${id} and nominaFuenteNovedad/modulo eq 'Embargos'&$count=true`);
        // tslint:disable-next-line: max-line-length
        const url = `${environmentAlcanos.novedades}/odata/nominaDetalles?${params}`;
        return new Promise((resolve, reject) => {
          this._httpClient.get(url)
            .subscribe((response: any) => {
              resolve(response);
            }, reject);
        });
      }
}