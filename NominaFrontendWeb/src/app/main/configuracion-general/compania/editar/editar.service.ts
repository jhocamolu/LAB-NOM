import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class EditarService {

    routeParams: any;
    router: Router;
    compania: any[];
    onCompaniasChanged: BehaviorSubject<any>;
    onPaisesChanged: BehaviorSubject<any>;
    onAdministradoraChanged: BehaviorSubject<any>;
    onTipoContribuyentesChanged: BehaviorSubject<any>;
    onActividadEconomicaChanged: BehaviorSubject<any>;
    onOperadorPagosChanged: BehaviorSubject<any>;
    onTipoDocumentoChanged: BehaviorSubject<any>;
    onNaturalezaJuridicaChanged: BehaviorSubject<any>;
    onTipoPersonaChanged: BehaviorSubject<any>;
    onCargosChanged: BehaviorSubject<any>;
    oncClaseAportanteChanged: BehaviorSubject<any>;
    onTipoAportanteChanged: BehaviorSubject<any>;

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.onCompaniasChanged = new BehaviorSubject({});
        this.onPaisesChanged = new BehaviorSubject({});
        this.onAdministradoraChanged = new BehaviorSubject([]);
        this.onTipoContribuyentesChanged = new BehaviorSubject([]);
        this.onActividadEconomicaChanged = new BehaviorSubject([]);
        this.onOperadorPagosChanged = new BehaviorSubject([]);
        this.onTipoDocumentoChanged = new BehaviorSubject([]);
        this.onNaturalezaJuridicaChanged = new BehaviorSubject([]);
        this.onTipoPersonaChanged = new BehaviorSubject([]);
        this.onCargosChanged = new BehaviorSubject([]);
        this.oncClaseAportanteChanged = new BehaviorSubject([]);
        this.onTipoAportanteChanged = new BehaviorSubject([]);
    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.routeParams = route.params;

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getCompania(this.routeParams.id),
                this.getPaises(),
                this.getActividadEconomicaLista(),
                this.getAdministradoraList(),
                this.getOperadorPagos(),
                this.getTipoContribuyentesList(),
                this.getTipoDocumentos(),
                this.getNaturalezaJuridica(),
                this.getTipoPersonas(),
                this.getCargos(),
                this.getClasesAportante(),
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
     * @param id // Obtiene datos del compania
     * @returns {Promise<any>}
     */
    private getCompania(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const params = encodeURI(`$orderBY=id asc&$top=1&$expand=actividadEconomica,divisionPoliticaNivel2($expand=divisionPoliticaNivel1($expand=pais)),tipoContribuyente,operadorPago,arl($expand=TipoAdministradora),tipoDocumento,naturalezaJuridica,tipoPersona,claseAportanteTipoAportante($expand=claseAportante,tipoAportante),cargo`);
            const url = `${environmentAlcanos.configuracionGeneral}/odata/InformacionBasicas?${params}`;
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.compania = response.value[0];
                    this.onCompaniasChanged.next(this.compania);
                    resolve(response.value[0]);
                }, reject);
        });
    }

    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    editar(id: number, dato: any): Promise<any> {
        dato.actividadEconomicaId = dato.actividadEconomicaId['id'];
        dato.divisionPoliticaNivel2Id = dato.municipioOrigenId;
        dato.claseAportanteTipoAportanteId = dato.tipoAportanteId
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.configuracionGeneral}/api/InformacionBasicas/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    private getPaises(): Promise<any> {
        const url = `${environmentAlcanos.configuracionGeneral}/odata/paises?$orderby=nombre`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onPaisesChanged.next(response.value);
                resolve(response);
            }, reject);
        });
    }

    /**
     * 
     * @param paisId 
     * @returns {Promise<any>}
     */
    public getDepartamentos(paisId: number): Promise<any> {
        const params = encodeURI(`$filter=paisId eq ${paisId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/divisionPoliticaNiveles1?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

    /**
     * 
     * @param departamentoId 
     * @returns {Promise<any>}
     */
    public getMunicipios(departamentoId: number): Promise<any> {
        const params = encodeURI(`$filter=divisionPoliticaNivel1Id eq ${departamentoId} and estadoRegistro eq 'Activo'&$orderby=nombre`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/divisionPoliticaNiveles2?${params}`;
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
    private getAdministradoraList(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre&$filter=estadoRegistro eq 'Activo' and tipoAdministradora/codigo eq 'ARL'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/administradoras?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                this.onAdministradoraChanged.next(response.value);
                resolve(response);
            }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    private getActividadEconomicaLista(): Promise<any> {
        return new Promise((resolve, reject) => {
            const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
            const url = `${environmentAlcanos.configuracionGeneral}/odata/ActividadEconomicas?${params}`;
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onActividadEconomicaChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getTipoContribuyentesList(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/tipoContribuyentes?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onTipoContribuyentesChanged.next(response.value);
                    resolve(response.value);
                }, reject);
        });
    }


    /**
     * 
     * @returns {Promise<any>}
     */
    private getOperadorPagos(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/operadorPagos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onOperadorPagosChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getTipoDocumentos(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/tipoDocumentos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onTipoDocumentoChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getNaturalezaJuridica(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/NaturalezaJuridicas?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onNaturalezaJuridicaChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getCargos(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/cargos?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onCargosChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getTipoPersonas(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/TipoPersonas?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onTipoPersonaChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @returns {Promise<any>}
     */
    private getClasesAportante(): Promise<any> {
        const params = encodeURI(`$orderBy=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/ClaseAportantes?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.oncClaseAportanteChanged.next(response.value);
                    resolve();
                }, reject);
        });
    }


    /**
     * 
     * @param paisId 
     * @returns {Promise<any>}
     */
    public getTiposAportante(claseAportanteId: number): Promise<any> {
        const params = encodeURI(`$filter=claseAportanteId eq ${claseAportanteId} and estadoRegistro eq 'Activo'&$expand=tipoAportante&$orderby=tipoAportante/nombre`);
        const url = `${environmentAlcanos.configuracionGeneral}/odata/ClaseAportanteTipoAportantes?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }


}
