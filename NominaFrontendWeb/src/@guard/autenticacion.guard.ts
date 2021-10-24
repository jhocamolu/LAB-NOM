import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AutorizacionService } from 'app/main/autorizacion/login/autorizacion.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionGuard implements CanActivate {

  constructor(private router: Router,
              private _autorizacionService: AutorizacionService,) { }

  canActivate(_route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.user != null) { 
      return true; 
    }

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }


  get user(): any {
    const user = this._autorizacionService.currentUserValue;
    if (user) {
      return user;
    }
    return null;
  }
}
