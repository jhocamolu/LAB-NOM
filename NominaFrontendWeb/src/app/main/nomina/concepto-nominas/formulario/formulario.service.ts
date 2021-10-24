import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

    tab: number;
    id: number;
    onItemChanged: BehaviorSubject<any>;

    onClaseConceptonominaChanged: BehaviorSubject<any[]>;
    onTipoConceptoNominaChanged: BehaviorSubject<any[]>;
    onFuncionNominasChanged: BehaviorSubject<any>;



    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.onClaseConceptonominaChanged = new BehaviorSubject([]);
        this.onTipoConceptoNominaChanged = new BehaviorSubject([]);
        this.onFuncionNominasChanged = new BehaviorSubject({});
        // Set the defaults
        this.onItemChanged = new BehaviorSubject(null);
        this.tab = 0;
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.id = route.params.id ? route.params.id : null;
        this.tab = route.queryParams.tab != null ? route.queryParams.tab : 0;

        this.onItemChanged.next(null);
        const promises = [
            this._getClaseConceptonominas(),
            this._getFuncionNominas(),
            this._getTipoConceptoNominas()
        ];
        if (this.id) {
            promises.push(this._getConceptoNomina(this.id));
        }
        return new Promise((resolve, reject) => {
            Promise.all([
                promises
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
    private _getConceptoNomina(id: number): Promise<any> {
        // const params = encodeURI('$expand=cuentaContable');
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptonominas/${id}`)
                .subscribe((response: any) => {
                    this.onItemChanged.next(response);
                    resolve();
                }, reject);
        });
    }



    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getItemAsociadas(conceptoAgrupador: boolean, id: number): Promise<any> {
        let params = encodeURI(
            `$filter=conceptoNominaId eq ${id} and estadoRegistro eq 'Activo'`
        );
        if (conceptoAgrupador) {
            params = encodeURI(
                `$filter=conceptoNominaAgrupadorId eq ${id} and estadoRegistro eq 'Activo'`
            );
        }
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptobases?$expand=conceptoNomina,conceptoNominaAgrupador&${params}`)
                .subscribe((response: any) => {
                    const ids = [];
                    response.value.forEach(element => {
                        if (conceptoAgrupador) {
                            ids.push({
                                id: element.conceptoNominaId,
                                nombre: element.conceptoNomina.nombre,
                                conceptoAgrupador: element.conceptoNomina.conceptoAgrupador
                            });
                        } else {
                            ids.push({
                                id: element.conceptoNominaAgrupadorId,
                                nombre: element.conceptoNominaAgrupador.nombre,
                                conceptoAgrupador: element.conceptoNominaAgrupador.conceptoAgrupador
                            });
                        }
                    });
                    resolve(ids);
                }, reject);
        });
    }


    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getAsociadas(conceptoAgrupador: boolean, id: number | null = null): Promise<any> {
        const filterId = id ? ` and id Ne ${id}` : '';
        const params = encodeURI(
            `$select=id,nombre&$filter=conceptoAgrupador eq ${conceptoAgrupador} and estadoRegistro eq 'Activo'${filterId}`
        );
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private _getClaseConceptonominas(): Promise<any> {
        return new Promise((resolve, reject) => {
            const items = [
                {
                    id: 'Devengo',
                    nombre: 'Devengo',
                },
                {
                    id: 'Deduccion',
                    nombre: 'Deducción',
                },
                {
                    id: 'Calculo',
                    nombre: 'Cálculo',
                }
            ];
            this.onClaseConceptonominaChanged.next(items);
            resolve();
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private _getTipoConceptoNominas(): Promise<any> {
        return new Promise((resolve, reject) => {
            const items = [
                {
                    id: 'Fijo',
                    nombre: 'Fijo',
                },
                {
                    id: 'Novedad',
                    nombre: 'Novedad',
                },
            ];
            this.onTipoConceptoNominaChanged.next(items);
            resolve();
        });
    }

    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public _getFuncionNominas(): Promise<any> {
        const params = encodeURI(`$select=id,nombre,paraCantidad&$filter=estadoRegistro eq 'Activo' and paraCantidad eq true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/funcionNominas/?${params}`)
                .subscribe((response: any) => {
                    this.onFuncionNominasChanged.next(response.value);
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getTipoAdministradoras(): Promise<any> {
        const params = encodeURI(`$select=id,codigo,nombre&$filter=estadoRegistro eq 'Activo'&$orderBy=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/tipoadministradoras?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }


    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    public getTipoAdministradorasSolo(conceptoNominaId: number): Promise<any> {
        const params = encodeURI(`$filter=conceptoNominaId eq ${conceptoNominaId} and estadoRegistro eq 'Activo'&$select=id,conceptoNominaId,tipoAdministradoraId&$orderBy=tipoAdministradora/id`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.nomina}/odata/ConceptoNominaTipoAdministradoras?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }




    /**
     * 
     * @param value // Obtiene datos del cargo
     * @returns {Promise<any>}
     * @filter * lista de elementos incluidos en los params 
     * @ordenacion 
     * Si es agrupador en true; acepta a hijos en false en orden menores al orden insertado
     * Si es agrupador en false; acepta a hijos en true en orden mayores al orden insertado
     */
    public getConceptoAsociado(filtro: number, conceptoAgrupador: boolean, orden: number): Promise<any> {
        const filterCodigo = `contains(codigo, '${filtro}')`;
        const filterNombre = `contains(nombre, '${filtro}')`;
        const orderby = `$orderby=nombre asc`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterCodigo} or ${filterNombre}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,nombre,codigo,conceptoAgrupador,orden`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {

                    const ordenacion: any[] = [];
                    if (orden != null) {
                        response.value.forEach(element => {

                            if (conceptoAgrupador == false) {
                                if (element.conceptoAgrupador == true) {
                                    if (orden < element.orden) {
                                        ordenacion.push({
                                            id: element.id,
                                            codigo: element.codigo,
                                            orden: element.orden,
                                            nombre: element.nombre,
                                            conceptoAgrupador: element.conceptoAgrupador
                                        });
                                    }
                                }
                            }

                            if (conceptoAgrupador == true) {
                                if (element.conceptoAgrupador == false) {
                                    if (orden > element.orden) {
                                        ordenacion.push({
                                            id: element.id,
                                            codigo: element.codigo,
                                            orden: element.orden,
                                            nombre: element.nombre,
                                            conceptoAgrupador: element.conceptoAgrupador
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        response.value.forEach(element => {
                            if (conceptoAgrupador == false) {
                                if (element.conceptoAgrupador == true) {
                                    ordenacion.push({
                                        id: element.id,
                                        codigo: element.codigo,
                                        orden: element.orden,
                                        nombre: element.nombre,
                                        conceptoAgrupador: element.conceptoAgrupador
                                    });
                                }
                            }

                            if (conceptoAgrupador == true) {
                                if (element.conceptoAgrupador == false) {
                                    ordenacion.push({
                                        id: element.id,
                                        codigo: element.codigo,
                                        orden: element.orden,
                                        nombre: element.nombre,
                                        conceptoAgrupador: element.conceptoAgrupador
                                    });
                                }
                            }
                        });
                    }
                    resolve(ordenacion);
                }, reject);
        });
    }

    /**
     * 
     * @param dato 
     */
    public upsert(dato: any): Promise<any> {
        if (this.id) {
            return this._editar(this.id, dato);
        }
        return this._crear(dato);
    }

    /**      
     * @param dato 
     * @returns {Promise<any>}
     */
    private _crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.nomina}/api/conceptonominas`,
                dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    private _editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.nomina}/api/conceptonominas/${id}`,
                dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}
