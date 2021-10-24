import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Route, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TipoAplicacionExterna } from '@alcanos/constantes/aplicacion-externa';
import { DashboardService } from 'app/main/dashboard/dashboard.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'convocatoria-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  item: any;
  loading: boolean = true;
  user:any;
  loadingSave: boolean = false;
  private _unsubscribeAll: Subscription;
  constructor(
    private _service: MostrarService,
    private _router: Router,
    private _dashboardService: DashboardService,
    private _cookieService: CookieService,
    private _alcanosSnackBar: AlcanosSnackBarService
  ) {
  }

  ngOnInit(): void {

    this._unsubscribeAll = this._dashboardService.itemChange.subscribe(data => {
      if (data){
        this._service.getConvocatoria(data['id']).then(result => {
          this.loading = false;
          this.item = result
        })
      }
    })

    if (this._cookieService.check('User')) {
      let token = JSON.parse(this._cookieService.get('User')).token
      this.user = JSON.parse(atob(token.split('.')[1]))
    } else {
      this._router.navigate(['/logout'])
      return
    }
  }

  ngOnDestroy() {
    this._unsubscribeAll.unsubscribe();
  }

  changeMenu(): void {
    this._dashboardService.onFilterChanged.next('convocatorias');
    this._dashboardService.onFilterSubChanged.next('');
    this._dashboardService.nextItem(null)
  }

  aplicarConvocatoria(){
    this.loadingSave = true;
    this._service._getAspirante(this.user.jti).then(data =>{
      let aplicar ={
        hojaDeVidaId: data.value[0].id,
        requisicionPersonalId:this.item.id
      }
      this._service._aplicarConvocatoria(aplicar).then(data=>{
        this.loadingSave = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: 'Has aplicado a la convocatoria con exito.', time: 6000 });
        this._dashboardService.onFilterChanged.next('aplicaciones');
        this._dashboardService.onFilterSubChanged.next('');
        this._dashboardService.nextItem(null)
      }).catch(error =>{
        console.log(error)
      })
    })
}

}