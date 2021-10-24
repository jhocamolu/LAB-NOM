
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';

@Injectable({
    providedIn: 'root'
})
export class MostrarService {

    constructor(
        private _httpClient: HttpClient
    ) { }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    public getTerceros(id: number): Promise<any> {
        const params = encodeURI(`$select=id,nombre,nit,digitoVerificacion,divisionPoliticaNivel2Id,telefono,direccion,entidadFinancieraId,tipoCuentaId,numeroCuenta,descripcion,estadoRegistro&$expand=divisionPoliticaNivel2($select=id,codigo,nombre,divisionPoliticaNivel1id;$expand=divisionPoliticaNivel1($select=id,codigo,nombre,paisid; $expand=pais($select=id,codigo,nombre))),entidadFinanciera($select=id, codigo,nombre),tipoCuenta($select=id,nombre)`);
        const url = `${environmentAlcanos.novedades}/odata/terceros/${id}?${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }



}





