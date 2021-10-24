import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AutorizacionService } from 'app/main/autorizacion/login/autorizacion.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  constructor(
              private _router: Router,
              private _autorizacionService: AutorizacionService,
              private _cookieService: CookieService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentUser =  null
    if(this._cookieService.check('User')){
      currentUser = JSON.parse(this._cookieService.get('User'))
      if (currentUser && currentUser.token) {
        request = request.clone({
          setHeaders: {
            JwtToken: currentUser.token
          }
        });
      }
    }    
    return next.handle(request);
  }
}
