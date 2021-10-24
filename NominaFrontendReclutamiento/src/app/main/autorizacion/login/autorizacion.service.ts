import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
    providedIn: 'root'
})
export class AutorizacionService {
    public userSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;

    constructor(private http: HttpClient,
                private cookieService: CookieService ) {
        if(this.cookieService.check('User')){
            this.userSubject = new BehaviorSubject<any>(JSON.parse(this.cookieService.get('User')));
        }else{
            this.userSubject = new BehaviorSubject<any>(null);
        }
        
        this.currentUser = this.userSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.userSubject.value;
    }

    public login(correoElectronicoPersonal, clave): Observable<HttpResponse<any>> {
        return this.http.post(`${environmentAlcanos.portal}/api/autenticaciones/login`, { correoElectronicoPersonal, clave },
            {   //Se añaden los headers en la peticion, para que no de error de cors
                headers:
                    { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                observe: 'response'
            }).pipe(map(user => {
                if(user.body['token']){
                    this.cookieService.set('User',JSON.stringify(user.body));
                    this.userSubject.next(user);
                }
                return user;
            }, error => {
                console.log(error)
            }));
    }
    // Comento esto, mientras se analiza el comportamiento del refresh
    // public refreshToken() {
    //     return this.http.post<any>(`${environmentAlcanos.configuracionGeneral}/users/refresh-token`, {}, { withCredentials: true })
    //         .pipe(map((user) => {
    //             this.userSubject.next(user);
    //             this.startRefreshTokenTimer();
    //             return user;
    //         }));
    // }

    // private refreshTokenTimeout;

    // private startRefreshTokenTimer() {
    //     // parse json object from base64 encoded jwt token
    //     const jwtToken = JSON.parse(atob(this.currentUserValue.t.split('.')[1]));

    //     // set a timeout to refresh the token a minute before it expires
    //     const expires = new Date(jwtToken.exp * 1000);
    //     const timeout = expires.getTime() - Date.now() - (60 * 1000);
    //     this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    // }

    // private stopRefreshTokenTimer() {
    //     clearTimeout(this.refreshTokenTimeout);
    // }
}
