import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LogService {

    urlFilters: any;
    page: number;

    notificacionId: number;
    totalCount: number;
    onLogChanged: BehaviorSubject<any[]>;

    /**
     * 
     * @param  {HttpClient} _httpClient 
     */
    constructor(private _httpClient: HttpClient) {
        this.totalCount = 0;
        this.onLogChanged = new BehaviorSubject([]);
    }

    public init(notificacionId: number): void {
        this.notificacionId = notificacionId;
        this.totalCount = 0;
        this.buildFilter({});
    }

    public buildFilter(filters): Promise<any> {
        this.urlFilters = JSON.parse(JSON.stringify(filters));
        if (this.urlFilters.hasOwnProperty('$top') === false || this.urlFilters.hasOwnProperty('$skip') === false) {
            this.page = 0;
            this.urlFilters['$top'] = 5;
            this.urlFilters['$skip'] = 0;
        } else {
            this.page = Math.round(this.urlFilters['$skip'] / this.urlFilters['$top']);
        }

        this.urlFilters['$filter'] = `notificacionId eq ${this.notificacionId}`;
        return this._getLog(this.urlFilters);
    }

    
    /**
     * 
     * @param id 
     * @returns {Promise<any>}
     */
    private _getLog(params: any): Promise<any> {
        const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
        const uriParam = encodeURI('$expand=funcionario,notificacion&$count=true&$orderBy=fechaCreacion desc'); 
        const url = `${environmentAlcanos.nomina}/odata/NotificacionDestinatarioLogs?${uriParam}&${toUrlEncoded(params)}`;
        return new Promise((resolve, reject) => {
            this._httpClient.get(url)
                .subscribe((response: any) => {
                    this.totalCount = response['@odata.count'];
                    this.onLogChanged.next(response.value);
                    resolve(response.value);
                }, reject);
        });
    }



}

