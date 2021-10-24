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

    public login(cedula, clave): Observable<HttpResponse<any>> {
        return this.http.post(`${environmentAlcanos.configuracionGeneral}/api/Autenticacion/Login`, { cedula, clave },
            {   //Se añaden los headers en la peticion, para que no de error de cors
                headers:
                    { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                observe: 'response'
            }).pipe(map(user => {
                if(user.body['token']){
                    // LAs lineas comentados es para controlar el tiempo de vencimiento del token en caso de que se necesiten hacer pruebas
                    // console.log(JSON.stringify(user.body['vencimiento']))
                    // const now = new Date();
                    // now.setSeconds(now.getSeconds() + 20);
                    // this.cookieService.set('User',JSON.stringify(user.body),now,'/');
                    this.cookieService.set('User',JSON.stringify(user.body),new Date(user.body['vencimiento']),'/');
                    this.userSubject.next(user);
                }
                return user;
            }, error => {
              //  console.log(error)
            }));
    }

    public permisos(aplicacion: any,token): Promise<any> {
        return new Promise((resolve, reject) => {
          this.http.post(`${environmentAlcanos.configuracionGeneral}/api/Autenticacion/PermisoAplicacion`, aplicacion,
          {   //Se añaden los headers en la peticion, para que no de error de cors
            headers:
                { 'JwtToken': token, 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            observe: 'response'
          }
          )
            .subscribe((response: any) => {
              resolve(response);
            }, reject);
        });
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
