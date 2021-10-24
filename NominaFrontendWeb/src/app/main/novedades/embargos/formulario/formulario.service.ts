
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';


@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

    id: number | null;
    item: any | null;
    changed: any;


    // BehaviorSubject
    onItemChanged: BehaviorSubject<any>;
    onTipoEmbargosChanged: BehaviorSubject<any[]>;
    onSubPeriodosChanged: BehaviorSubject<any[]>;
    onEntidadFinancierasChanged: BehaviorSubject<any[]>;
    onTipoPeriodosChanged: BehaviorSubject<any[]>;
    onEmbargoConceptoNominasChanged: BehaviorSubject<any>;
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
        this.onTipoEmbargosChanged = new BehaviorSubject([]);
        this.onSubPeriodosChanged = new BehaviorSubject([]);
        this.onEntidadFinancierasChanged = new BehaviorSubject([]);
        this.onTipoPeriodosChanged = new BehaviorSubject([]);
        this.onEmbargoConceptoNominasChanged = new BehaviorSubject(null);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.id = null;
        this.item = null;
        this.onItemChanged = new BehaviorSubject(null);
        const promises = [
            this.getTipoEmbargos(),
            this.getPeriodoPago(),
            this.getEntidadFinancieras(),
            this.getTipoPeriodos()
        ];
        if (route.params.id != null) {
            this.id = route.params.id;
            promises.push(this._getEmbargos(this.id));
            promises.push(this.getEmbargoConceptoNominasId(this.id));
        }
        return new Promise((resolve, reject) => {
            Promise.all(promises).then(
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
    private _getEmbargos(id: number): Promise<any> {
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


    /**
     * 
     * @param funcionarioId
     * @param prioridad 
     * @returns {Promise<any>}
     * Obtiene la prioridad del embargo validando el Funcionario y la prioridad
     */
    public prioridad(funcionarioId: number, prioridad: number): Promise<any> {
        const params = encodeURI(
            `$filter=funcionarioId eq ${funcionarioId} and prioridad eq ${prioridad}&$select=funcionarioId,prioridad&$count=true`
        );
        const url = `${environmentAlcanos.novedades}/odata/embargos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    /**
     * @param id
     * @returns {Promise<any>}
     */
    public getSubPeriodos(id: number): Promise<any> {
        const params = encodeURI(`$filter=tipoPeriodoId eq ${id}`);
        const url = `${environmentAlcanos.novedades}/odata/subperiodos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getFuncionarios(filtro: string): Promise<any> {
        const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
        const orderby = `$orderby=primerNombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterCriterioBusqueda}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,criterioBusqueda`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        const url = `${environmentAlcanos.novedades}/odata/funcionarios?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * 
     * @param filtro
     * @returns {Promise<any>}
     */
    public getJuzgados(filtro: string): Promise<any> {
        const orderby = `$orderby=nombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(contains(nombre, '${filtro}')) and estadoRegistro eq 'Activo'`;
        const params = encodeURI(`${orderby}&${filter}`);
        const url = `${environmentAlcanos.novedades}/odata/juzgados?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * Inicial
     * @returns {Promise<any>}
     */
    public getTipoPeriodos(): Promise<any> {
        const param = `$filter=pagoPorDefecto eq true and estadoRegistro eq 'Activo'&$count=true&$orderby=nombre asc`;
        const url = encodeURI(`${environmentAlcanos.configuracionGeneral}/odata/tipoperiodos?${param}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onTipoPeriodosChanged.next(response);
                resolve(response);
            }, reject);
        });
    }

    /**
     * Sumado
     * @param id
     * @returns {Promise<any>}
     */
    public getTipoPeriodosId(id: number): Promise<any> {
        const url = encodeURI(`${environmentAlcanos.configuracionGeneral}/odata/tipoperiodos/${id}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getTipoEmbargos(): Promise<any> {
        const param = encodeURI(`$filter=estadoRegistro eq 'Activo'&$count=true`);
        const url = `${environmentAlcanos.novedades}/odata/tipoembargos?${param}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onTipoEmbargosChanged.next(response.value);
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getPeriodoPago(): Promise<any> {
        const url = `${environmentAlcanos.novedades}/odata/subperiodos`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onSubPeriodosChanged.next(response.value);
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getEntidadFinancieras(): Promise<any> {
        const url = `${environmentAlcanos.novedades}/odata/entidadFinancieras?$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onEntidadFinancierasChanged.next(response.value);
                resolve(response);
            }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    public getDatosActuales(id: number): Promise<any> {
        const urlEncode = encodeURI(`$expand=contrato`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    public getConceptoNominas(id: number): Promise<any> {
        const param = encodeURI(`$filter=tipoEmbargoId eq ${id} and estadoRegistro eq 'Activo' and conceptoNomina/claseConceptoNomina eq 'Devengo'&$expand=tipoEmbargo,conceptoNomina`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas?${param}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }



    public getEmbargoConceptoNominasId(id: number): Promise<any> {
        const param = encodeURI(`$filter=embargoId eq ${id}&$count=true&$expand=conceptonomina($select=nombre,id)`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/embargoconceptonominas?${param}`)
                .subscribe((response: any) => {
                    this.onEmbargoConceptoNominasChanged.next(response.value);
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    public upsert(dato: any): Promise<any> {
        if (this.item !== null && this.id !== null) {
            return this._editar(this.item.id, dato);
        }
        return this._crear(dato);
    }

    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    private _editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.novedades}/api/embargos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }



    /**
     * @param dato 
     * @returns {Promise<any>}
     */
    private _crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/embargos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}