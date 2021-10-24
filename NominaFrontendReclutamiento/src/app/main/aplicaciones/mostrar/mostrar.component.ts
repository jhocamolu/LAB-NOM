import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Route, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TipoAplicacionExterna } from '@alcanos/constantes/aplicacion-externa';
import { DashboardService } from 'app/main/dashboard/dashboard.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';

@Component({
  selector: 'aplicacion-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  item: any;
  loading: boolean = true;
  loadingSave: boolean = false;
  private _unsubscribeAll: Subscription;
  constructor(
    private _service: MostrarService,
    private _router: Router,
    private _dashboardService: DashboardService,
    private _alcanosSnackBar: AlcanosSnackBarService
  ) { 
  }

  ngOnInit(): void {
    // this._dashboardService.onItemSend
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe(item => {
    //     this.item = item;
    //     console.log(item)
    //   });

    this._unsubscribeAll = this._dashboardService.itemChange.subscribe(data => {
      if (data){
        this._service.getAplicacion(data['id']).then(result => {
          this.loading = false;
          this.item = result
        })
      } 
    })
  }

  ngOnDestroy() {
    this._unsubscribeAll.unsubscribe();
  }

  changeMenu(): void
    {   
        this._dashboardService.onFilterChanged.next('aplicaciones');
        this._dashboardService.onFilterSubChanged.next('');
        this._dashboardService.nextItem(null)
    }

    eliminarAplicacion(dato){
      this.loadingSave = true;
      this._service.eliminarAplicacion(dato).then(data => {
        this.loadingSave = false;
        this._alcanosSnackBar.snackbar({ clase: 'exito', mensaje: 'Has eliminado la aplicación a la convocatoria con exito.', time: 6000 });
        this._dashboardService.onFilterChanged.next('aplicaciones');
        this._dashboardService.onFilterSubChanged.next('');
        this._dashboardService.nextItem(null)
      })
    }
}
