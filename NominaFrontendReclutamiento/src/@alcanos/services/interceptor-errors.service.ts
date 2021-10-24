import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AutorizacionService } from 'app/main/autorizacion/login/autorizacion.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorErrorService {

  constructor(
              private router: Router,
              private _autorizacionService: AutorizacionService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(request).pipe(catchError ((erro:HttpErrorResponse) => {
      //Controlar los errores segun las peticiones, esto esta por definir
      if(erro.status === 401){
        this.router.navigate(['/logout'])
      }else if (erro.status === 404){
      }else if (erro.status === 500){
        this.router.navigate(['/logout'])
      }else if (erro.status === 422){
        
      }
      const error = erro || erro.message;
      return throwError(error);
    }))
  }
  
}
