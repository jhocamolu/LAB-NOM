import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class EditarService implements Resolve<any> {

    id: number;
    cargo: any[];
    onConceptoNomina: BehaviorSubject<any[]>;
    onItemChanged: BehaviorSubject<any>;

    countConcepto: number;
    item: any[];
    selectedTab: number;
    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.onItemChanged = new BehaviorSubject(null);
        this.onConceptoNomina = new BehaviorSubject([]);
        this.selectedTab = 0;
    }

    /**
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.id = route.params.id;
        this.onItemChanged = new BehaviorSubject(null);

        if (route.queryParams.tab != null) {
            this.selectedTab = route.queryParams.tab;
        } else {
            this.selectedTab = 0;
        }


        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTipoEmbargo(this.id),
                this.getConceptoNomina(),
                this.getConceptoNominaCalculo()
            ]).then(() => { resolve(); }, reject);
        });
    }

    /**
     * 
     * @param id // Obtiene datos del tipo embargo concepto de nómina para cargar el editor
     * @returns {Promise<any>}
     */
    private getTipoEmbargo(id: number): Promise<any> {
        const params = encodeURI(`$expand=conceptoNomina,tipoEmbargo`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas/${id}?${params}`)
                .subscribe((response: any) => {
                    this.item = response;
                    this.onItemChanged.next(this.item);
                    resolve(response);
                }, reject);
        });
    }


    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los conceptos de nómina para cargar el select
     */
    public getConceptoNomina(): Promise<any> {
        const params = encodeURI(`&$filter=claseConceptoNomina eq 'Deduccion' and estadoRegistro eq 'Activo'&$orderBy=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {
                    this.onConceptoNomina.next(response.value);
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los conceptos de nómina para cargar el select
     */
    public getConceptoNominaCalculo(): Promise<any> {
        const params = encodeURI(`&$filter=claseConceptoNomina eq 'Devengo' and estadoRegistro ne 'Eliminado'&$orderBy=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/conceptonominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los datos del concepto de Calculo añadido
     */
    public getConceptoNominaIntent(id: number): Promise<any> {
        const params = encodeURI(`$expand=conceptoNomina,tipoEmbargo&$filter=tipoEmbargoId eq ${id}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene los datos del concepto de Calculo añadido
     */
    public getConceptoNominaCalculoEditar(id: number): Promise<any> {
        const params = encodeURI(`$expand=conceptoNomina,tipoEmbargo`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas/${id}?${params}`)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    /**
     * @returns {Promise<any>}
     */
    public _getTipoEmbargoConceptoNominas(id: number): Promise<any> {
        const params = encodeURI(`$expand=conceptoNomina,tipoEmbargo&$filter=conceptoNomina/claseConceptoNomina eq 'Devengo' and tipoEmbargoId eq ${id}&orderBy=conceptoNomina/nombre asc&$count=true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/TipoEmbargoConceptoNominas?${params}`)
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
    editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/tipoembargos/${id}`,
                dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    borrar(id: number): Promise<any> {
        const url = `${environmentAlcanos.configuracionGeneral}/api/TipoEmbargoConceptoNominas/${id}`;
        return new Promise((resolve, reject) => {
            this._httpClient.delete(url)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene Todas los Nivel Cargos para llenar select asc Nombre
     */
    getNivelCargoLista(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/nivelcargos?$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * @param resolve 
     * @returns {Promise<any>}
     * Obtiene Todas las Grados para llenar select asc Nombre
     */
    getGradosLista(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.configuracionGeneral}/odata/CargoGrados?$expand=cargo&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * @param id 
     * @param activo 
     * @returns {Promise<any>}
     */
    activo(id: number, activo: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.configuracionGeneral}/api/CargoGrados/${id}`, {
                id: id,
                activo: activo
            })
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
    crearConcepto(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/TipoEmbargoConceptoNominas`, dato, { responseType: 'text' })
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
    editarConcepto(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/TipoEmbargoConceptoNominas/${id}`, dato, { responseType: 'text' })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
