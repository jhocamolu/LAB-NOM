
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { codigoPermisosAlcanos } from '@alcanos/constantes/estado-permisos';


@Injectable({
    providedIn: 'root'
})
export class FormularioService implements Resolve<any>{

    id: number | null;
    item: any | null;
    changed: any;

    totalCount: number;
    items: any;
    path: any;

    selectedTab: number;

    // BehaviorSubject
    onItemChanged: BehaviorSubject<any>;
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
        route.url.map((resp) => {
            this.path = resp.path;
        });

        if (route.queryParams.tab != null) {
            this.selectedTab = route.queryParams.tab;
        } else {
            this.selectedTab = 0;
        }

        this.onItemChanged = new BehaviorSubject(null);
        const promises = [];
        if (route.params.id != null) {
            this.id = route.params.id;
            promises.push(this._getContratoAdministradoraCambios(this.id));
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
     *
     * @returns {Promise<any>}
     */
    private _getContratoAdministradoraCambios(id: number): Promise<any> {
        const element = `$expand=contrato($select=id,funcionarioId,estado),centroTrabajoActual($select=id,codigo,nombre),funcionario($select=id,primerNombre,primerApellido,numeroDocumento,criterioBusqueda)`;
        const url = `${environmentAlcanos.configuracionGeneral}/odata/ContratoCentroTrabajoCambios/${id}?${element}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.totalCount = response['@odata.count'];
                    this.item = response;
                    this.onItemChanged.next(this.item);
                    resolve(response);
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
     * @returns {Promise<any>}
     */
    public getDatosActuales(id: number): Promise<any> {
        const urlEncode = encodeURI(`$select=id,estado,criterioBusqueda&$expand=contrato($select=id,estado;$expand=funcionario($select=id,estado))`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/FuncionarioDatoActuales/${id}?${urlEncode}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response);
            }, reject);
        });
    }

    /**
     * Listado de todos los centros de trabajo ordenados por Nombre
     * @returns {Promise<any>}
     */
    public getCentroTrabajos(): Promise<any> {
        const params = encodeURI(`$filter=estadoRegistro eq 'Activo'&$orderBy=nombre asc`);
        const url = `${environmentAlcanos.novedades}/odata/centroTrabajos?${params}`;
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
    public getCentroTrabajoSolo(value: any): Promise<any> {
        const params = encodeURI(`$select=id,contratoId,centroTrabajoId,estadoRegistro,fechaFin&$filter=estadoRegistro eq 'Activo' and contrato/funcionarioId eq ${value.id} and fechaFin eq null&$top=10&$expand=contrato($select=id,funcionarioId,estado),centroTrabajo($select=id,codigo,nombre,estadoRegistro)`);
        const url = `${environmentAlcanos.novedades}/odata/ContratoCentroTrabajos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
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
            this._httpClient.put(`${environmentAlcanos.novedades}/api/ContratoCentroTrabajos/${id}`, dato)
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
            this._httpClient.post(`${environmentAlcanos.novedades}/api/ContratoCentroTrabajos`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

}