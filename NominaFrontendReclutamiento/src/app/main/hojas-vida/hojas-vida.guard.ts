import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HojasVidaGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {

    if (url.includes('/reclutamiento-seleccion/hojas-vida')) {
      if (url.includes('/mostrar')) {
        if (this.permisos.find(x => x === 'HojaDeVidas_Obtener')) {
          return true;
        }
      }else  if (url.includes('/datos-basicos')) {
        if (this.permisos.find(x => x === 'HojaDeVidas_Actualizar')) {
          return true;
        }
      }else  if (url.includes('/estudio')) {
        if (this.permisos.find(x => x === 'HojaDeVidaEstudios_Crear')) {
          return true;
        }
      }else  if (url.includes('/experiencia-laboral')) {
        if (this.permisos.find(x => x === 'HojaDeVidaExperienciaLaborales_Crear')) {
          return true;
        }
      }else  if (url.includes('/documentos')) {
        if (this.permisos.find(x => x === 'HojaDeVidaDocumentos_Crear')) {
          return true;
        }
      }else if (this.permisos.find(x => x === 'HojaDeVidas_Listar')) {
        return true;
      }
    }

    

;


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
