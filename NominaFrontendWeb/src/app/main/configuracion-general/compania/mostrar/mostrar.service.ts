import { Injectable } from "@angular/core";
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environmentAlcanos } from "environments/environment.alcanos";

@Injectable({
    providedIn: "root"
})
export class MostrarService implements Resolve<any> {
    item: any;
    vacio: any[];
    onItemChanged: BehaviorSubject<any>;

    /**
     *
     * @param _httpClient
     */
    constructor(private _httpClient: HttpClient) {
        this.onItemChanged = new BehaviorSubject({});
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        const id = route.params.id;

        return new Promise((resolve, reject) => {
            Promise.all([this.getCompania(id)]).then(() => {
                resolve();
            }, reject);
        });
    }

    /**
     *
     *
     * @returns {Promise<any>}
     */
    public getCompania(id: number): Promise<any> {
        const params = encodeURI(
            `$orderBY=id asc&$top=1&$expand=actividadEconomica,divisionPoliticaNivel2($expand=divisionPoliticaNivel1($expand=pais)),tipoContribuyente,operadorPago,arl($expand=TipoAdministradora),tipoDocumento,naturalezaJuridica,tipoPersona,claseAportanteTipoAportante($expand=claseAportante,tipoAportante),cargo`
        );
        const url = `${environmentAlcanos.configuracionGeneral}/odata/InformacionBasicas?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.vacio = response.value;
                if (this.vacio.length != 0) {
                    this.item = response.value[0];
                    this.onItemChanged.next(this.item);
                    resolve(response.value[0]);
                } else {
                    resolve();
                }
            }, reject);
        });
    }
}
