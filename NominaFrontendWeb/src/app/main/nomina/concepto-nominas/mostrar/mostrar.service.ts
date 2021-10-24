import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class MostrarService implements Resolve<any> {


    id: number;
    item: any;
    onItemChanged: BehaviorSubject<any>;


    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.onItemChanged = new BehaviorSubject({});

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
                this._getConceptoNomina(this.id),
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
     * @param id // Obtiene datos del tipo de liquidaciones
     * @returns {Promise<any>}
     */
    private _getConceptoNomina(id: number): Promise<any> {
        const url = `${environmentAlcanos.configuracionGeneral}/odata/Conceptonominas/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.item = response;
                this.onItemChanged.next(this.item);
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getTipoAdministradorasSolo(conceptoNominaId: number): Promise<any> {
        const params = encodeURI(`$expand=tipoAdministradora&$filter=conceptoNominaId eq ${conceptoNominaId} and estadoRegistro eq 'Activo'&$select=id,conceptoNominaId,tipoAdministradoraId&$orderBy=tipoAdministradora/id`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/ConceptoNominaTipoAdministradoras?${params}&$count=true`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
