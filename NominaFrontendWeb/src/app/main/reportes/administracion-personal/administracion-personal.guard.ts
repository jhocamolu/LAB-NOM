import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministracionPersonalGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(_route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const url: string = state.url;
    return this.check(url);
  }

  check(url: string): boolean {

    if (url.includes('/ausentismo-laboral')) {
      if (this.permisos.find(x => x === 'AusentismoLaboral_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/beneficio-corporativo')) {
      if (this.permisos.find(x => x === 'BeneficioCorporativo_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/familiares-funcionario')) {
      if (this.permisos.find(x => x === 'FamiliaresFuncionario_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/librovacaciones')) {
      if (this.permisos.find(x => x === 'LibroVacaciones_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/maestro-funcionarios')) {
      if (this.permisos.find(x => x === 'MaestroFuncionarios_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/planta-personal')) {
      if (this.permisos.find(x => x === 'PlantaPersonal_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/prorroga-contrato-termino-fijo')) {
      if (this.permisos.find(x => x === 'ProrrogaContratoTerminoFijo_GenerarReporte')) {
        return true;
      }
    }

    if (url.includes('/regreso-vacaciones-ausentismos')) {
      if (this.permisos.find(x => x === 'RegresoVacacionesAusentismos_GenerarReporte')) {
        return true;
      }
    }
    
 
    // Navigate to the login page with extras
    this.router.navigate(['/']);
    return false;
  }



  get permisos(): any {
    const permiso = JSON.parse(localStorage.getItem('Permisos'));
    //console.log( JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes('RegresoVaca')));
    if (permiso) {
      return permiso;
    }
    return null;
  }
}
