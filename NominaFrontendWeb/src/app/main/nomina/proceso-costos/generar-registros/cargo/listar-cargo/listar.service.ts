import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class ActividadesListarCargoService {

    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;

    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;

    onDependenciasChanged: BehaviorSubject<any>;
    onCargosChanged: BehaviorSubject<any>;

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
        this.onItemsChanged = new BehaviorSubject({});
        this.dataRequest = new BehaviorSubject(false);
        this.onDependenciasChanged = new BehaviorSubject({});
        this.onCargosChanged = new BehaviorSubject({});
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
        if (this.urlFilters.agregar == 'Cargo') {
            if (localStorage.getItem('carga') != null) {
                JSON.parse(localStorage.getItem('carga')).forEach(element => {
                    if (this.urlFilters.cargoId != element.cargoId) {
                        //localStorage.removeItem('carga');
                    }
                });
            }
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getCargoCentroCostos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getCargoCentroCostos() {
        return this._getCargoCentroCostos(this.urlFilters);
    }

    private _getCargoCentroCostos(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(params);
        });
    }

    consultaStorage(response, count, modificado?): void {
        if (response.value != undefined) {

            let finData = [];
            let dbPorcentaje = 0;

            if (count > 0) {
                response.value.forEach(element => {
                    dbPorcentaje += Number(element.porcentaje);
                    finData.push(element);
                });
            }

            let idCode = 0;
            if (JSON.parse(localStorage.getItem('carga')) != null) {
                if (JSON.parse(localStorage.getItem('carga')).length > 0) {
                    JSON.parse(localStorage.getItem('carga')).forEach(element => {
                        idCode++;
                        finData.push({
                            id: Number(element.id),
                            funcionarioId: Number(element.funcionarioId),
                            cantidad: null,
                            porcentaje: Number(element.porcentaje / 100),
                            actividadCentroCosto: {
                                centroCosto: {
                                    codigo: element.centroCosto.codigo,
                                    id: element.centroCosto.id,
                                    nombre: element.centroCosto.nombre
                                }
                            },
                            actividadCentroCostoId: element.actividadCentroCostoId,
                            fechaCorte: element.fechaCorte,
                            formaRegistro: element.formaRegistro,
                            cargado: true,
                        });



                        this.totalCount = finData.length;
                        this.items = finData;
                        this.onItemsChanged.next(finData);

                    });

                } else {
                    this.onItemsChanged.next(finData);
                }
            }
        }
    }


    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getCargos(id: number): Promise<any> {
        const url = `${environmentAlcanos.novedades}/odata/cargos/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/CargoCentroCostos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}



