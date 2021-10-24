import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AlcanosConfigService } from '@alcanos/services/config.service';
import { Router } from '@angular/router';
import { AutorizacionService } from './autorizacion.service';
import { first } from 'rxjs/internal/operators/first';
import { AlcanosValidators } from '@alcanos/utils';

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
    submit: boolean;
    loading: boolean;
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

        if (this._autorizacionService.currentUserValue) {
            this._router.navigate(['/']);
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
            correoElectronicoPersonal: [null, [AlcanosValidators.correoElectronico, Validators.required]],
            password: ['', Validators.required]
        });
    }



    get correoElectronicoPersonal(): AbstractControl {
        return this.loginForm.get('correoElectronicoPersonal');
    }

    loginHandle(event): void {
        const formValue = this.loginForm.value;
        const errors = {};
        this.correoElectronicoPersonal.setErrors(errors)
        this.correoElectronicoPersonal.clearValidators()
        this.correoElectronicoPersonal.updateValueAndValidity()
        this.submit = true;
        this.loading = true
        this._autorizacionService.login(formValue.correoElectronicoPersonal, formValue.password).pipe(first()).subscribe(data => {
            if (!data.body.token) {
                errors[data.body.error] = true
                this.correoElectronicoPersonal.setErrors(errors);
                this.submit = false;
                this.loading = false;
            } else {
                this._router.navigate(['/']);
            }
        }, error => {
            errors[error.error.message] = true
            this.correoElectronicoPersonal.setErrors(errors);
            this.submit = false;
            this.loading = false;
        });

    }

    objToArray(obj: any): any[] {
        return obj !== null ? Object.keys(obj) : [];
    }
}
