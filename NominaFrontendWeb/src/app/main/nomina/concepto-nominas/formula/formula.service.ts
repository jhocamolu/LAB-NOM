import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FormulaService {

    onConceptosChange: BehaviorSubject<any[]>;
    onFuncionesChange: BehaviorSubject<any[]>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        this.onConceptosChange = new BehaviorSubject([]);
        this.onFuncionesChange = new BehaviorSubject([]);
    }

    public init(item: any): void {
        this._getConceptoNominas(item.orden);
        this._getFunciones();
    }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getConceptoNominas(orden: number): Promise<any> {
        const filter = encodeURI(
            `orden lt ${orden}`
        );
        const url = `${environmentAlcanos.nomina}/odata/conceptoNominas?$filter=${filter}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onConceptosChange.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     *
     * @returns {Promise<any>}
     */
    private _getFunciones(): Promise<any> {
        const url = `${environmentAlcanos.nomina}/odata/funcionNominas`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.onFuncionesChange.next(response.value);
                    resolve();
                }, reject);
        });
    }

    /**
     * 
     * @param dato 
     * @returns {Promise<any>}
     */
    editar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.patch(`${environmentAlcanos.nomina}/api/formulas/${id}`, dato)
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
    verificar(id: number, dato: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._httpClient.post(`${environmentAlcanos.nomina}/api/formulas/${id}`, dato)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }


}
