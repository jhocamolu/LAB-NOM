import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseMatchMediaService } from '@fuse/services/match-media.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

import { FavoritosService } from './shortcuts.service';
import { id } from '@swimlane/ngx-charts/release/utils';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { Router } from '@angular/router';
import { SharedServiceProf } from '@alcanos/services/shared.service';


@Component({
    selector: 'fuse-shortcuts',
    templateUrl: './shortcuts.component.html',
    styleUrls: ['./shortcuts.component.scss']
})
export class FuseShortcutsComponent implements OnInit, AfterViewInit, OnDestroy {
    shortcutItems: any[];
    navigationItems: any[];
    filteredNavigationItems: any[];
    searching: boolean;
    mobileShortcutsPanelActive: boolean;


    @Input()
    navigation: any;

    @ViewChild('searchInput', { static: false })
    searchInputField;

    @ViewChild('shortcuts', { static: false })
    shortcutsEl: ElementRef;

    tocken: any;
    // Permisos
    arrayPermisos: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {CookieService} _cookieService
     * @param {FuseMatchMediaService} _fuseMatchMediaService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {MediaObserver} _mediaObserver
     * @param {Renderer2} _renderer
     */
    constructor(
        private _cookieService: CookieService,
        private _fuseMatchMediaService: FuseMatchMediaService,
        private _fuseNavigationService: FuseNavigationService,
        private _mediaObserver: MediaObserver,
        private _renderer: Renderer2,
        private _service: FavoritosService,
        private _permisos: PermisosrService,
        private _router: Router,
        private sharedService: SharedServiceProf
    ) {
        // Set the defaults
        this.shortcutItems = [];
        this.searching = false;
        this.mobileShortcutsPanelActive = false;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (this._cookieService.check('User')){
            if (!JSON.parse(localStorage.getItem('Permisos'))) {
                // this._router.navigate(['/logout']);
            } else {
                this.arrayPermisos = this._permisos.permisosStorage('_MenuFavoritos_');
                this.actualizarDatos();
            }
        }
        

        // this.tocken = JSON.parse(atob(JSON.parse(this._cookieService.get('User')).token.split('.')[1])).Identificacion;
        // console.log(this.tocken);
        // console.log(JSON.parse(this._cookieService.get('User')));
        // Get the navigation items and flatten them

        // Contenido antiguo de la plantilla 103 - 134
        // if (this._cookieService.check('FUSE2.shortcuts')) {
        //     this.shortcutItems = JSON.parse(this._cookieService.get('FUSE2.shortcuts'));
        // }
        // else {
        // User's shortcut items
        // this.shortcutItems = [
        //     {
        //         title: 'Calendar',
        //         type: 'item',
        //         icon: 'today',
        //         url: '/apps/calendar'
        //     },
        //     {
        //         title: 'Mail',
        //         type: 'item',
        //         icon: 'email',
        //         url: '/apps/mail'
        //     },
        //     {
        //         title: 'Contacts',
        //         type: 'item',
        //         icon: 'account_box',
        //         url: '/apps/contacts'
        //     },
        //     {
        //         title: 'To-Do',
        //         type: 'item',
        //         icon: 'check_box',
        //         url: '/apps/todo'
        //     }
        // ];
        // }

    }

    actualizarDatos(): void {
        this.filteredNavigationItems = this.navigationItems = this._fuseNavigationService.getFlatNavigation(this.navigation);
        // Se elimina el contenido usado por FUSE y se conecta la data al servicio el token requerido se envia por el interceptor
        this._service.getMenuFavoritos().then(resp => {
            this.filteredNavigationItems.map(value => {
                resp.forEach(element => {
                    // se evalua el hidden ya que este determina el mostarse el permiso que viene desde el menú
                    if (value.id === element.itemMenu && value.hidden != true) {
                        this.shortcutItems.push({
                            id: element.id,
                            itemMenu: element.itemMenu,
                            title: value.title,
                            type: value.type,
                            icon: value.icon,
                            url: value.url,
                            hidden: value.hidden
                        });
                    }
                });
            });
        });
    }

    ngAfterViewInit(): void {
        // Subscribe to media changes
        this._fuseMatchMediaService.onMediaChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if (this._mediaObserver.isActive('gt-sm')) {
                    this.hideMobileShortcutsPanel();
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Search
     *
     * @param event
     */
    search(event): void {
        const value = event.target.value.toLowerCase();
        if (value === '') {
            this.searching = false;
            this.filteredNavigationItems = this.navigationItems;
            return;
        }
        this.searching = true;

        this.filteredNavigationItems = this.navigationItems.filter((navigationItem) => {
            // se evalua el hidden en el search de navigation Item para ocultar los campos con permisos
            if (navigationItem.hidden != true) {
                return navigationItem.title.toLowerCase().includes(value);
            }
        });
    }

    /**
     * Toggle shortcut
     * Delete service
     * @param event
     * @param itemToToggle
     */
    toggleShortcut(event, itemToToggle): void {
        event.stopPropagation();

        for (let i = 0; i < this.shortcutItems.length; i++) {
            if (this.shortcutItems[i].url === itemToToggle.url) {
                // se hace un splice mostrando la data desde la cache si se intercambia la pagina se actualiza por la BD
                this.shortcutItems.splice(i, 1);

                // console.log(itemToToggle);
                // this._service.getMenuFavoritosSolo().then(resp => {
                //     console.log(resp);
                // });
                // se envía el id al servicio delete el tocken se senvía por el interceptor
                if (typeof itemToToggle.id !== 'string') {
                    this._service.borrar(itemToToggle.id);
                } else {
                    // se envía el id de la chache en formato string y regresa el id en formato number
                    this._service.getMenuFavoritosSolo(itemToToggle.id).then(resp => {
                        resp.map(value => {
                            this._service.borrar(value.id);
                        });
                    });
                }
                return;
            }
        }

        // se hace un push guardando la data desde la cache si se intercambia la pagina se actualiza por la BD -- se envia el id para cargar el servicio
        this._service.crear(itemToToggle.id);
        this.shortcutItems.push(itemToToggle);

        // Save to the cookies -- el sistema de fuse enviado a la cookie se remplaza por la data del servicio
        //this._cookieService.set('FUSE2.shortcuts', JSON.stringify(this.shortcutItems));
    }

    /**
     * Is in shortcuts?
     *
     * @param navigationItem
     * @returns {any}
     */
    isInShortcuts(navigationItem): any {
        return this.shortcutItems.find(item => {
            return item.url === navigationItem.url;
        });
    }

    /**
     * On menu open
     */
    onMenuOpen(): void {
        setTimeout(() => {
            this.searchInputField.nativeElement.focus();
        });
    }

    /**
     * Show mobile shortcuts
     */
    showMobileShortcutsPanel(): void {
        this.mobileShortcutsPanelActive = true;
        this._renderer.addClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }

    /**
     * Hide mobile shortcuts
     */
    hideMobileShortcutsPanel(): void {
        this.mobileShortcutsPanelActive = false;
        this._renderer.removeClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }
}
