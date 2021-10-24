import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import { AutorizacionService } from 'app/main/autorizacion/login/autorizacion.service';
import { CookieService } from 'ngx-cookie-service';
import { ToolbarService } from './toolbar.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedServiceProf } from '@alcanos/services/shared.service';

@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    appOnline: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    user:any;
    imagen:any;
    message:string;
    nombres:string;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private _autorizacionService: AutorizacionService,
        private _cookieService: CookieService,
        private _toolbarService: ToolbarService,
        private sanitizer: DomSanitizer,
        private sharedService: SharedServiceProf
    )
    {
        this.message = localStorage.getItem('changeImagen')
        if(this._cookieService.check('User') ){
            let cedula = JSON.parse(atob(JSON.parse(this._cookieService.get('User')).token.split('.')[1])).Identificacion
            let info = JSON.parse(localStorage.getItem('info'))
            if(info && info.cedula === cedula && localStorage.getItem('nombres')){
                this.nombres = localStorage.getItem('nombres')
            }
            this.user = this._autorizacionService.currentUserValue ? (this._autorizacionService.currentUserValue.body ? this._autorizacionService.currentUserValue.body : this._autorizacionService.currentUserValue) : null;
            if(!this.message){
                if(this.user && this.user.urlImagen){
                    this._toolbarService.getImagenPerfil(this.user.urlImagen.substring(3)).then(data=>{
                        let objectURL = URL.createObjectURL(data);       
                        this.imagen = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                    }).catch(error=>{
                        this.imagen = null
                    })
                }
            }else{
                this.user = this._autorizacionService.currentUserValue ? (this._autorizacionService.currentUserValue.body ? this._autorizacionService.currentUserValue.body : this._autorizacionService.currentUserValue) : null;
                this._toolbarService.getImagenPerfil('/bucket/download?document_id='+this.message).then(data=>{
                    let objectURL = URL.createObjectURL(data);       
                    this.imagen = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                }).catch(error=>{
                    this.imagen = null
                })
            }
        }
        
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon : 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon : 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon : 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {   
        if(this._cookieService.check('User')){
            this.sharedService.sharedMessage.subscribe(message => {
                let cedula = JSON.parse(atob(JSON.parse(this._cookieService.get('User')).token.split('.')[1])).Identificacion
                if(message && message['cedula'] === cedula && message['cambioFoto']){
                    this._toolbarService.getImagenPerfil('/bucket/download?document_id='+message['codeImagen']).then(data=>{
                        let objectURL = URL.createObjectURL(data);       
                        this.imagen = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                    }).catch(error=>{
                        this.imagen = null
                    })
                }
                if(message && message['cedula'] === cedula && message['cambioNombre']){
                    this.nombres = localStorage.getItem('nombres')
                }
            })
        }

        
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
       // this.selectedLanguage = _.find(this.languages, {id: this._translateService.currentLang});
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void
    {
        // Do your search here...
        
    }

 }
