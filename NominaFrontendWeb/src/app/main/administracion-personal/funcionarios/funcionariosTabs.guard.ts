import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FuncionariosTabsGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(_route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const url: string = state.url;
        return this.check(url);
    }

    check(url: string): boolean {

        if (url.includes('/administracion-personal/funcionarios')) {
            if (url.includes('/familiar')) {
                if (url.includes('/familiar/')) {
                    if (this.permisos.find(x => x === 'InformacionFamiliares_Actualizar')) {
                        return true;
                    }
                } else if (this.permisos.find(x => x === 'InformacionFamiliares_Crear')) {
                    return true;
                }
            }

            if (url.includes('/estudio')) {
                if (url.includes('/estudio/')) {
                    if (this.permisos.find(x => x === 'FuncionarioEstudios_Actualizar')) {
                        return true;
                    }
                } else if (this.permisos.find(x => x === 'FuncionarioEstudios_Crear')) {
                    return true;
                }
            }

            if (url.includes('/experiencia-laboral')) {
                if (url.includes('/experiencia-laboral/')) {
                    if (this.permisos.find(x => x === 'ExperienciaLaborales_Actualizar')) {
                        return true;
                    }
                } else if (this.permisos.find(x => x === 'ExperienciaLaborales_Crear')) {
                    return true;
                }
            }

            if (url.includes('/documentos')) {
                if (this.permisos.find(x => x === 'DocumentoFuncionarios_Crear')) {
                    return true;
                }
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
