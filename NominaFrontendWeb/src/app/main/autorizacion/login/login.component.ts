import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosConfigService } from '@alcanos/services/config.service';
import { Router } from '@angular/router';
import { AutorizacionService } from './autorizacion.service';
import { first } from 'rxjs/internal/operators/first';
import { AlcanosValidators } from '@alcanos/utils';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    alcanosConfig: any;
    submit:boolean;
    loading:boolean;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {AlcanosConfigService} _alcanosConfigService
     * @param {FormBuilder} _formBuilder
     * @param {Router} _router
     * @param {AutorizacionService} _autorizacionService
     */
    constructor(
          
        private _fuseConfigService: FuseConfigService,
        private _alcanosConfigService: AlcanosConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _autorizacionService: AutorizacionService,
        private cookieService: CookieService
        
    ) {
        
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this.alcanosConfig = this._alcanosConfigService.defaultConfig;
        
        
        if (this.cookieService.check('User')) {
            this._router.navigate(['/']);
        }else{
            this._autorizacionService.userSubject.next(null)
            this.cookieService.deleteAll()
            localStorage.removeItem('Permisos')
            localStorage.removeItem('changeImagen')
            localStorage.removeItem('nombres')
        }
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            usuario: ['', [Validators.required, AlcanosValidators.numerico, Validators.max(9999999999)]],
            password: ['', Validators.required]
        });
    }



    get usuario(): AbstractControl {
        return this.loginForm.get('usuario');
    }

    get password(): AbstractControl {
        return this.loginForm.get('password');
    }

    loginHandle(event): void {
        const formValue = this.loginForm.value;
        const errors = {};
        this.submit = true;
        this.loading = true
        if(!formValue.usuario || !formValue.password){
            this.submit = false
            this.loading = false
            return
        }
        this._autorizacionService.login(formValue.usuario, formValue.password).pipe(first()).subscribe(data => {
            this.loading = true;
            if(!data.body.token){
                errors[data.body.error] = true
                this.password.setErrors(errors);
                this.submit = false;
                this.loading = false;
            }else{
                let aplicacion = {
                    "aplicacion": "GHESTIC"
                }
                this._autorizacionService.permisos(aplicacion,data.body.token).then(data =>{
                    localStorage.setItem('Permisos',JSON.stringify(data.body.permisos))
                    // this._router.navigate(['/']);
                    window.location.reload();
                    this.loading = false;
                })
                
                
            }
            
          }, error => {
              console.log(error)
                errors[error.body.error] = true
                this.password.setErrors(errors);
                this.submit = false;
                this.loading = false;
          });
          
    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }
}
