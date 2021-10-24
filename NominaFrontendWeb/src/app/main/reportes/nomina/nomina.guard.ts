import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominaGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {

    if (url.includes('/archivo-tipo-2-pila')) {
      if (this.permisos.find(x => x === 'ArchivoTipo2Pila_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/novedades-embargo')) {
      if (this.permisos.find(x => x === 'NovedadesEmbargo_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/novedades-libranza')) {
      if (this.permisos.find(x => x === 'NovedadesLibranza_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/consolidado-conceptos-nomina')) {
      if (this.permisos.find(x => x === 'ConsolidadoConceptosNomina_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/archivo-dispersion')) {
      if (this.permisos.find(x => x === 'ArchivoDispersion_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/bitacora-nomina')) {
      if (this.permisos.find(x => x === 'BitacoraNomina_GenerarReporte')) {
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
