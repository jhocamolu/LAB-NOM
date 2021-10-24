import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';


@Injectable({
    providedIn: 'root'
})
export class AprobarService {

    onItemChanged: BehaviorSubject<any>;
    onGraphicChanged: BehaviorSubject<any>;
    id: number;
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _alcanosSnackBar: AlcanosSnackBarService
    ) {
        this.onItemChanged = new BehaviorSubject(null);
        this.onGraphicChanged = new BehaviorSubject(null);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        const promises = [];
        this.onItemChanged.next(null);
        if (route.params.id) {
            promises.push(this._getNomina(route.params.id));
            promises.push(this._getGrafica(route.params.id));
        }

        this.id = route.params.id;
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(
                () => {
                    resolve();
                },
                reject
            );
        }).catch(resp => {
            this._alcanosSnackBar.snackbar({
                mensaje: resp.status === 404 ? resp.error.message : null,
                clase: 'error',
                time: 5000
            });
        });
    }

    public refreshData(): Promise<any> {
        const promises = [];
        this.onItemChanged.next(null);
        return new Promise((resolve, reject) => {
            Promise.all([promises.push(this._getNomina(this.id)), promises.push(this._getGrafica(this.id))]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    private _getNomina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/api/nominas/NominaCabecera/${id}?`)
                .subscribe((response: any) => {
                    this.onItemChanged.next(response);
                    resolve();
                }, reject);
        });
    }

    private _getGrafica(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/api/nominas/graficas/${id}`)
                .subscribe((response: any) => {
                    this.onGraphicChanged.next(response);
                    resolve();
                }, reject);
        });
    }


    public aprobar(id: number, type: boolean): Promise<any> {
        const dato = {
            id: id,
            aprobar: type
        };
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.administracionPersonal}/api/nominas/aprobar/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    public aplicar(id: number): Promise<any> {
        const dato = {
            id: id
        };
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.administracionPersonal}/api/nominas/aplicar/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * @param id 
     * @returns {Promise<any>}
     */
    public getIdNomina(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/nominas/${id}?$select=estado`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }



}
