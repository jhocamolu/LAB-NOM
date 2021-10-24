import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmbargosGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {

    if (url.includes('/novedades/embargos')) {
      if (url.includes('/crear')) {
        if (this.permisos.find(x => x === 'Embargos_Crear')) {
          return true;
        }
      }else  if (url.includes('/editar')) {
        if (this.permisos.find(x => x === 'Embargos_Actualizar')) {
          return true;
        }
      }else if (this.permisos.find(x => x === 'Embargos_Listar')) {
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
