import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class CrearFamiliaresFuncionarioService {

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(
        private _httpClient: HttpClient
    ) {

    }


    /**
     * 
     * @returns {Promise<any>}
     */
    public getCentroOperativos(): Promise<any> {
        const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/centrooperativos?${params}`;
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
    public getDependencias(): Promise<any> {
        const params = encodeURI(`$select=id,codigo,nombre&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/dependencias?${params}`;
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
    public getParentescos(): Promise<any> {
        const params = encodeURI(`$select=id,tipo,nombre,grado&$orderby=nombre asc&$filter=estadoRegistro eq 'Activo'`);
        const url = `${environmentAlcanos.administracionPersonal}/odata/parentescos?${params}`;
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
    public getCargo(): Promise<any> {
        const params = encodeURI(`$select=id,nombre&$filter=estadoRegistro eq 'Activo'&$orderby=nombre asc`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
                .subscribe((response: any) => {
                    resolve(response.value);
                }, reject);
        });
    }

    /**
     * 
     * @param value // Obtiene datos del cargo
     * @returns {Promise<any>}
     */
    public getSoloCargo(filtro: number): Promise<any> {
        const filterNombre = `contains(nombre, '${filtro}')`;
        const orderby = `$orderby=nombre`;
        // tslint:disable-next-line: max-line-length
        const filter = `$filter=(${filterNombre}) and estadoRegistro eq 'Activo'`;
        const select = `$select=id,nombre`;
        const params = encodeURI(`${orderby}&${filter}&${select}`);
        return new Promise((resolve, reject) => {
            this._httpClient.get(`${environmentAlcanos.administracionPersonal}/odata/cargos?${params}`)
                .subscribe((response: any) => {
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
     * @returns {Promise<any>}
     */
    public getDatosActuales(id: number): Promise<any> {
        //const urlEncode = encodeURI(`$select=id,primerNombre,primerApellido,numeroDocumento,adjunto,estado&$expand=contrato($select=estado;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=id,cargoId;$expand=cargo($select=nombre))),ContratoOtroSi($select=fechaAplicacion;$expand=centroOperativo($select=id,nombre),cargoDependencia($select=cargoId;$expand=cargo($select=nombre),dependencia($select=nombre,codigo)))`);
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
    crear(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.configuracionGeneral}/reporte/FamiliaresFuncionario`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }
}
