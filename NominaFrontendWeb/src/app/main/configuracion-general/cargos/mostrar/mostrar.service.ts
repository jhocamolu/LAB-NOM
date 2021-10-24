import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class MostrarService implements Resolve<any>{

    id: number;
    element: any;
    reporta: any;
    dependencias: any;
    grados: any;
    grupos: any;
    presupuestos: any;
    //
    onCargoChanged: BehaviorSubject<any>;
    onReportaChanged: BehaviorSubject<any>;
    onDependenciasChanged: BehaviorSubject<any>;
    onGradosChanged: BehaviorSubject<any>;
    onGruposChanged: BehaviorSubject<any>;
    onCargoPresupuestos: BehaviorSubject<any[]>;
    onDataCargosReporta: BehaviorSubject<any[]>;

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.onCargoChanged = new BehaviorSubject({});
        this.onReportaChanged = new BehaviorSubject({});
        this.onDependenciasChanged = new BehaviorSubject({});
        this.onGradosChanged = new BehaviorSubject({});
        this.onGruposChanged = new BehaviorSubject({});
        this.onCargoPresupuestos = new BehaviorSubject([]);
        this.onDataCargosReporta = new BehaviorSubject([]);
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

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getCargo(this.id),
                this.getCargosReportas(),
                this.getCargoDependencias(),
                this.getCargosGrados(),
                this.getCargoGrupos(),
                this.getCargoPresupuestos()
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
     * @param id // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getCargo(id: number): Promise<any> {
        const params = encodeURI('$expand=nivelcargo&');
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos/${id}?${params}`)
                .subscribe((response: any) => {
                    this.element = response;
                    this.onCargoChanged.next(this.element);
                    resolve(response);
                }, reject);
        });
    }

    public getCargosReportas(): void {
        this._getCargosReportas(this.id);
    }

    /**
     * @param resolve
     * @id Id del Cargo
     * @returns {Promise<any>}
     * Obtiene Todas las Dependencias para llenar select asc Nombre
     */
    // Version 4 
    private _getCargosReportas(id: number): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const params = encodeURI(`$select=cargoDependenciaId,id,cargoDependenciaReportaId,estadoRegistro,jefeInmediato&$expand=cargoDependenciaReporta($select=id,cargoId,dependenciaId;$expand=cargo($select=id,nombre),dependencia($select=id,nombre)),cargoDependencia($select=id,dependenciaId,cargoId,estadoRegistro;$expand=dependencia($select=id,codigo,nombre),cargo($select=id,codigo,nombre))&$filter=cargoDependencia/cargoId eq ${id} and estadoRegistro eq 'Activo'`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoReportas?${params}`)
                .subscribe((response: any) => {
                    this.onDataCargosReporta.next(response.value);
                    resolve(response);
                }, reject);
        });
    }


    public getCargoDependencias(): void {
        this._getCargoDependencias(this.id);
    }

    private _getCargoDependencias(id: number): Promise<any> {
        const params = encodeURI(`$expand=dependencia&$filter=cargoId eq ${id} and estadoRegistro ne 'Inactivo'  and estadoRegistro eq 'Activo'&$count=true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoDependencias?${params}`)
                .subscribe((response: any) => {
                    this.dependencias = response;
                    this.onDependenciasChanged.next(this.dependencias);
                    resolve(response);
                }, reject);
        });
    }



    public getCargosGrados(): void {
        this._getCargoGrados(this.id);
    }

    private _getCargoGrados(id: number): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const params = encodeURI(`$expand=cargo&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'&$count=true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargoGrados?${params}`)
                .subscribe((response: any) => {
                    this.grados = response;
                    this.onGradosChanged.next(this.grados);
                    resolve(response);
                }, reject);
        });
    }


    public getCargoGrupos(): void {
        this._getCargoGrupos(this.id);
    }

    private _getCargoGrupos(id: number): Promise<any> {
        // tslint:disable-next-line: max-line-length
        const params = encodeURI(`$expand=grupo&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'&$count=true`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoGrupos?${params}`)
                .subscribe((response: any) => {
                    this.grupos = response;
                    this.onGruposChanged.next(this.grupos);
                    resolve(response);
                }, reject);
        });
    }

    public getCargoPresupuestos(): void {
        this._getCargoPresupuestos(this.id);
    }

    /**
     * @param resolve 
     * @id Id del Cargo
     * @returns {Promise<any>}
     * Obtiene Todos las dependencias
     */
    private _getCargoPresupuestos(id: number): Promise<any> {
        const params = encodeURI(`$select=id,cargoId,annoVigenciaId,cantidad,estadoRegistro&$expand=annoVigencia($select=id,anno,estado,estadoRegistro)&$filter=cargoId eq ${id} and estadoRegistro eq 'Activo'`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/CargoPresupuestos?${params}`)
                .subscribe((response: any) => {
                    this.presupuestos = response;
                    this.onCargoPresupuestos.next(response);
                    resolve(response);
                }, reject);
        });
    }



    /**
     * @param id 
     * @param dato 
     * @returns {Promise<any>}
     */
    crearGrupo(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/api/CargoGrupos`, { cargoId: this.id })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
