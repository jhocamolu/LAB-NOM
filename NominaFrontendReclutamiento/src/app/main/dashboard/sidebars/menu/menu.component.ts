import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { GestrorArchivosUploadComponent } from 'app/main/gestor-archivos/upload/upload.component';
import { CookieService } from 'ngx-cookie-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../dashboard.service';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { SharedServiceProf } from '@alcanos/services/shared.service';

@Component({
    selector   : 'menu-sidebar',
    templateUrl: './menu.component.html',
    styleUrls  : ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy
{
    user: any;
    menu: string;
    submenu: string;
    disabled: boolean = false;
    block_menu: boolean;
    imagen: any;
    enviroments = environmentAlcanos.gestorArchivos;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ContactsService} _contactsService
     */
    constructor(
        private _dashboardService: DashboardService,
        private router: Router,
        private _matDialog : MatDialog,
        private _cookieService : CookieService,
        private _router: Router,
        private sharedService : SharedServiceProf
    )
    {
        if (this._cookieService.check('User')) {
            let token = JSON.parse(this._cookieService.get('User')).token
            this.user = JSON.parse(atob(token.split('.')[1]))
            // this.imagen = JSON.parse(this._cookieService.get('User')).urlImagen
          } else {
            this._router.navigate(['/logout'])
            return
          }
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
    this._dashboardService.onFilterChanged.subscribe(menu =>{
        this.menu = menu;
    })

    this._dashboardService.onBlockChanged.subscribe(block_menu =>{
        this.block_menu = block_menu;
    })

    this._dashboardService._getAspirante(this.user.jti).then(data =>{
      this.imagen = data.value[0].adjunto
    })

    this.sharedService.sharedMessage.subscribe(message => {
      this.imagen = message
    }
    )
        
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
     * Change the filter
     *
     * @param filter
     */
    changeMenu(menu): void
    {   
        this.changeSubMenu('')
        this.menu = menu;
        this._dashboardService.onFilterChanged.next(this.menu);
        this._dashboardService.nextItem(null)
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);
    }

    changeSubMenu(menu): void
    {
        this.submenu = menu;
        this._dashboardService.onFilterSubChanged.next(this.submenu);
    }

    cambiarImgHandle(event): void {
          const dialogRef = this._matDialog.open(GestrorArchivosUploadComponent, {
            disableClose: false,
            data: {
              id:this.user.id,
              imagen:true
            },
          });
          dialogRef.afterClosed().subscribe(confirm => {
            if (confirm != null) {
            //   this._service.editarImg(this.item.id, confirm.object_id).then(
            //     (resp) => {
            //       this.item.adjunto = resp.adjunto;
            //       this.sharedService.sharedMessage.subscribe(message => this.message = message)
            //       let info = {
            //         cedula:this.item.numeroDocumento,
            //         codeImagen:this.item.adjunto,
            //         cambioFoto:true
            //       }
            //       let cedula = JSON.parse(atob(JSON.parse(this._cookieService.get('User')).token.split('.')[1])).Identificacion
            //       if(cedula === this.item.numeroDocumento){
            //         this.sharedService.nextMessage(info)
            //         localStorage.setItem('changeImagen',this.item.adjunto)
            //       }
            //       this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            //         verticalPosition: 'top',
            //         duration: 3000,
            //         panelClass: ['exito-snackbar'],
            //       });
            //     }
            //   );
            }
          });
        }
    
}
