import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class ActividadesListarFuncionarioService {

    totalCount: number;
    urlFilters: any;
    page: number;
    dataFilters: any;

    items: any[];
    onItemsChanged: BehaviorSubject<any>;
    dataRequest: BehaviorSubject<boolean>;
    visible: boolean;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.visible = false;
        // Set the defaults
        this.totalCount = 0;
        this.dataFilters = {};
        this.onItemsChanged = new BehaviorSubject({});
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
        if (JSON.parse(localStorage.getItem('usuario')) == null) {
            this.visible = true;
            this.urlFilters = null;
            this.totalCount = 0;
            this.items = [];
        } else {
            this.visible = false;
            this.urlFilters = JSON.parse(localStorage.getItem('usuario'));
        }

        return new Promise((resolve, reject) => {
            Promise.all([
                this._getFuncionarioCentroCostos(this.urlFilters)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public getFuncionarioCentroCostos(): void {
        this._getFuncionarioCentroCostos(this.urlFilters);
    }

    private _getFuncionarioCentroCostos(params: any): Promise<any> {
        if (params == null) {
            return new Promise((resolve, reject) => {
                this.totalCount = 0;
                this.items = [];
                resolve({});
            }).catch(e => {
                return 'Error de acceso' + e;
            });
        }
        this.dataRequest.next(true);
        const element = decodeURI(`$select=id,porcentaje,actividadCentroCosto,actividadCentroCostoId,funcionarioId,fechaCorte,estado,formaRegistro&$expand=actividadCentroCosto($expand=centroCosto($select=id,nombre,codigo);$select=centroCosto)&$filter=funcionarioId eq ${params.funcionarioId}`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioCentroCostos?$count=true&${element}`;

        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    let count = response['@odata.count'];
                    let responseFinData = [];
                    let finData = [];
                    if (localStorage.getItem('bd') != "true") {
                        if (count > 0) {
                            response.value.forEach(element => {
                                // se cargan individualmente los datos provenientes de BD service
                                let actividadCentroCosto: any;
                                let centroCosto: any;
                                actividadCentroCosto = {
                                    centroCosto: {
                                        codigo: element.actividadCentroCosto.centroCosto.codigo,
                                        id: element.actividadCentroCosto.centroCosto.id,
                                        nombre: element.actividadCentroCosto.centroCosto.nombre
                                    }
                                };
                                centroCosto = {
                                    codigo: element.actividadCentroCosto.centroCosto.codigo,
                                    id: element.actividadCentroCosto.centroCosto.id,
                                    nombre: element.actividadCentroCosto.centroCosto.nombre
                                };

                                // se cargan invididualmente los datos del storage
                                responseFinData.push({
                                    id: Number(element.id),
                                    actividadCentroCostoId: Number(element.actividadCentroCostoId),
                                    funcionarioId: Number(element.funcionarioId),
                                    porcentaje: (element.porcentaje % 1 == 0) ? (element.porcentaje != 1 ? Number(element.porcentaje / 100) : 100) : Number(element.porcentaje),
                                    actividadCentroCosto: actividadCentroCosto,
                                    centroCosto: centroCosto,
                                    fechaCorte: element.fechaCorte,
                                    cargado: element.estado,
                                    estado: element.estado,
                                    formaRegistro: element.formaRegistro
                                });
                            });
                            this.totalCount = responseFinData.length;
                            this.items = responseFinData;
                            if (responseFinData.length > 0) {
                                localStorage.setItem('carga', JSON.stringify(responseFinData))
                            }
                            localStorage.setItem('bd', JSON.stringify(true));
                        }
                    }


                    let idCode = 0;
                    if (JSON.parse(localStorage.getItem('carga')) != null) {
                        if (JSON.parse(localStorage.getItem('carga')).length > 0) {
                            JSON.parse(localStorage.getItem('carga')).forEach(element => {
                                idCode++;
                                let actividadCentroCosto: any;
                                let centroCosto: any;
                                actividadCentroCosto = {
                                    centroCosto: {
                                        codigo: element.actividadCentroCosto.centroCosto.codigo,
                                        id: element.actividadCentroCosto.centroCosto.id,
                                        nombre: element.actividadCentroCosto.centroCosto.nombre
                                    }
                                };
                                centroCosto = {
                                    codigo: element.actividadCentroCosto.centroCosto.codigo,
                                    id: element.actividadCentroCosto.centroCosto.id,
                                    nombre: element.actividadCentroCosto.centroCosto.nombre
                                };
                                // se cargan invididualmente los datos del storage
                                finData.push({
                                    id: Number(element.id),
                                    actividadCentroCostoId: Number(element.actividadCentroCostoId),
                                    funcionarioId: Number(element.funcionarioId),
                                    porcentaje: element.porcentaje % 1 == 0 ? Number(element.porcentaje / 100) : Number(element.porcentaje),
                                    actividadCentroCosto: actividadCentroCosto,
                                    centroCosto: centroCosto,
                                    fechaCorte: element.fechaCorte,
                                    cargado: element.cargado,
                                    estado: element.estado,
                                    formaRegistro: element.formaRegistro
                                });
                                this.totalCount = finData.length;
                                this.items = finData;
                                this.onItemsChanged.next(finData);
                            });

                        } else {
                            this.totalCount = finData.length;
                            this.items = finData;
                            this.onItemsChanged.next(finData);
                        }
                    }

                    if (this.items == undefined) {
                        this.items = [];
                        this.totalCount = 0;
                    }

                    if (JSON.parse(localStorage.getItem('carga')) == null) {
                        this.items = [];
                        this.totalCount = 0;
                    }
                    this.dataRequest.next(false);
                    resolve(finData);
                }, reject);
        });
    }

    crear(dato: any, id: number): Promise<any> {
        if (JSON.parse(localStorage.getItem('editado')) && id != null) {
            return new Promise((resolve, reject) => {
                this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/FuncionarioCentroCostos/${id}`, dato)
                    .subscribe((response: any) => {
                        resolve(response);
                    }, reject);
            });
        } else {
            return new Promise((resolve, reject) => {
                this._httpClient.post(`${environmentAlcanos.administracionPersonal}/api/FuncionarioCentroCostos/CrearManual`, dato)
                    .subscribe((response: any) => {
                        resolve(response);
                    }, reject);
            });
        }
    }


    borrar(dato: any): Promise<any> {
        if (dato.formaRegistro == 'Storage') {

            let a = [];
            // a.push(dato);
            JSON.parse(localStorage.getItem('carga')).forEach(element => {
                if (element.id != dato.id) {
                    a.push(element);
                }
            });

            if (a.length > 0) {
                localStorage.setItem('carga', JSON.stringify(a));
            } else {
                localStorage.removeItem('carga');
            }

            return new Promise((resolve, reject) => {
                if (localStorage.getItem('carga') === null) {
                    localStorage.removeItem('bd');
                    localStorage.removeItem('carga');
                    localStorage.removeItem('editado');
                    resolve(['Borrado totalmente']);
                }
                reject(JSON.parse(localStorage.getItem('carga')));
            });
        }

    }


}



