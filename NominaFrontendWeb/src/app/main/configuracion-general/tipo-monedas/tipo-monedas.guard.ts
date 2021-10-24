import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoMonedasGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {


    if (url.includes('/configuracion/tipo-monedas')) {
      if (this.permisos.find(x => x === 'TipoMonedas_Listar')) {
        return true;
      }
    }

    // Navigate to the login page with extras
    this.router.navigate(['/']);
    return false;
  }


  get permisos(): any {
    const permiso = JSON.parse(localStorage.getItem('Permisos'))
    if (permiso) {
      return permiso;
    }
    return null;
  }
}
