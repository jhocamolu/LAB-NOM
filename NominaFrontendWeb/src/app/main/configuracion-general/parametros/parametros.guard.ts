import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {
    if (this.permisos.find(x => x === '')) { 
      return true; 
    }

    if (url === '/configuracion/parametros') {
      if (this.permisos.find(x => x === 'ParametroGenerales_Listar')) {
        return true;
      }
    }

    if (url.includes('/editar')) {
      if (this.permisos.find(x => x === 'ParametroGenerales_Actualizar')) {
        return true;
      }
    }

    if (url.includes('/mostrar')) {
      if (this.permisos.find(x => x === 'ParametroGenerales_Obtener')) {
        return true;
      }
    }

    // Navigate to the login page with extras
    this.router.navigate(['/']);
    return false;
  }


  get permisos(): any {
    const permiso = JSON.parse(localStorage.getItem('Permisos'));
    if (permiso) {
      return permiso;
    }
    return null;
  }
}
