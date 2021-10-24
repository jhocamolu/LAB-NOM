import { Injectable } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { HttpClient } from '@angular/common/http'; 

@Injectable({
    providedIn: 'root'
})
export class FormularioActividadCargoService {

    constructor(
        private _httpClient: HttpClient
    ) { }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    public generarRegistroGuardarFuncionarios(dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.nomina}/api/ActividadFuncionarios`, dato, { observe: 'response' })
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    public _generarRegistroEditarFuncionarios(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.put(`${environmentAlcanos.administracionPersonal}/api/funcionarioCentroCostos/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    public _generarRegistroEditarFuncionariosLocalStorage(id: number, dato: any): Promise<any> {
        let a = [];
        a.push(dato);
        dato.cargado = true;

        JSON.parse(localStorage.getItem('carga')).forEach(element => {
            if ( element.id != dato.id ) {
                a.push(element);
            }
        });
        localStorage.setItem('carga', JSON.stringify(a));

        return new Promise((resolve, reject) => {
            if(JSON.parse(localStorage.getItem('carga')).length == 0){
                reject('error'); 
            }
            resolve(true); 
        });
    }


    public getCentroCostosFiltro(filtro: string): Promise<any> {
        let params = encodeURI(``);
        if (filtro != '' || filtro != null) {
            const filterCodigo = `contains(centroCosto/codigo,'${filtro}')`;
            const filterNombre = `contains(centroCosto/nombre,'${filtro}')`;
            const orderby = `$orderby=centroCosto/nombre`;
            const filter = `$filter=(${filterNombre} or ${filterCodigo})`;
            params = encodeURI(`?${orderby}&${filter}&$expand=centroCosto($select=id,nombre,codigo)&$select=id,centroCostoId`);
        }
        const url = `${environmentAlcanos.nomina}/odata/actividadCentroCostos${params}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url).subscribe((response: any) => {
                resolve(response.value);
            }, reject);
        });
    }

}
