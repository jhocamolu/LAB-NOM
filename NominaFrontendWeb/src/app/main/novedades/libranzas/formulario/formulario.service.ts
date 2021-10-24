import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any> {

    id: any | null;

    item: any | null;
    onItemChanged: BehaviorSubject<any>;
    onEntidadFinancierasChanged: BehaviorSubject<any[]>;
    onTipoPeriodosChanged: BehaviorSubject<any[]>;

    constructor(
        private _httpClient: HttpClient
    ) {
        this.item = null;
        this.onItemChanged = new BehaviorSubject(null);
        this.onEntidadFinancierasChanged = new BehaviorSubject([]);
        this.onTipoPeriodosChanged = new BehaviorSubject([]);
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
        this.item = null;
        this.onItemChanged = new BehaviorSubject(null);

        const promises = [
            this._getEntidadFinancieras(),
            this.getTipoPeriodos()
        ];
        if (this.id != null) {
            promises.push(this._getLibranza(this.id));
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
     * @returns {Promise<any>}
     */
    private _getLibranza(id: number): Promise<any> {
        const expand = '$expand=funcionario,entidadFinanciera,LibranzaSubperiodos($expand=subPeriodo($expand=tipoPeriodo))';
        const url = `${environmentAlcanos.novedades}/odata/libranzas/${id}?${expand}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.item = response;
                    this.onItemChanged.next(this.item);
                    resolve();
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
    public getDatosActuales(id: number): Promise<any> {
        const urlEncode = encodeURI(`$expand=contrato`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    public upsert(dato: any): Promise<any> {
        if (this.item != null && this.id != null) {
            return this.editar(this.id, dato);
        }
        return this.crear(dato);
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    private editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.novedades}/api/Libranzas/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    private crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.novedades}/api/Libranzas`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private _getEntidadFinancieras(): Promise<any> {
        const params = encodeURI(`$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.novedades}/odata/entidadFinancieras?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onEntidadFinancierasChanged.next(response.value);
                resolve();
            }, reject);
        });
    }



    /**
     * 
     * @returns {Promise<any>}
     */
    public getFuncionarios(filtro: string): Promise<any> {
        const filterCriterioBusqueda = `contains(criterioBusqueda, '${filtro}')`;
        const orderby = `$orderby=criterioBusqueda`;
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
}
