import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AutorizacionService } from 'app/main/autorizacion/login/autorizacion.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  constructor(
              private _router: Router,
              private _autorizacionService: AutorizacionService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentUser
    if(this._autorizacionService.currentUserValue){
      currentUser = this._autorizacionService.currentUserValue.body || this._autorizacionService.currentUserValue
    }
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + currentUser.token,
          // 'Content-Type': 'application/json'
        }
      });
    }
    return next.handle(request);
  }
}
