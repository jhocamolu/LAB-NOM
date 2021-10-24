import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BotonAppsService } from './boton-apps.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-boton-apps',
    templateUrl: './boton-apps.component.html',
    styleUrls: ['./boton-apps.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BotonAppsComponent implements OnInit {

    // Permisos
    arrayPermisos: any;

    appOnline: any;

    constructor(
        private _service: BotonAppsService,
        private _permisos: PermisosrService,
        private _router: Router,
        private _cookieService: CookieService,
    ) {
        
        
        
    }

    ngOnInit(): void {
        if(this._cookieService.check('User')){
            if (!JSON.parse(localStorage.getItem('Permisos'))){
                // this._router.navigate(['/logout']);
            }else{
                this.arrayPermisos = this._permisos.permisosStorage('_EnlaceExternos_');
                this._service.getEnlaceExternos().then(resp => {
                    this.appOnline = resp;
                });
            }
        }
    }

}
