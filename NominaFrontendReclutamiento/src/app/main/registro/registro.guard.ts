import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContratosGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(_route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const url: string = state.url;
        return this.check(url);
    }

    check(url: string): boolean {

        if (url.includes('/administracion-personal/contratos')) {
            if (url.includes('/mostrar')) {
                if (this.permisos.find(x => x === 'Contratos_Obtener')) {
                    return true;
                }
            }else if (url.includes('/editar')) {
                if (this.permisos.find(x => x === 'Contratos_Actualizar')) {
                    return true;
                }
            }else if (url.includes('/crear')) {
                if (this.permisos.find(x => x === 'Contratos_Crear')) {
                    return true;
                }
            } else if (this.permisos.find(x => x === 'Contratos_Listar')) {
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
