import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Route, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TipoAplicacionExterna } from '@alcanos/constantes/aplicacion-externa';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'aprobaciones-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  item: any;
  selectedTab = 0;

  tipoAplicacion = TipoAplicacionExterna;
  arrayPermisos:any;
  constructor(
    private _service: MostrarService,
    private _router: Router,
    private _permisos : PermisosrService
  ) { }

  ngOnInit(): void {
    this.arrayPermisos = this._permisos.permisosStorage('AplicacionExternas_')
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );

  }

  public primero(): void {
    this.selectedTab = 0;
  }
  public segundo(): void {
    this.selectedTab = 1;
  }
  public tercero(): void {
    this.selectedTab = 2;
  }
  public cuarto(): void {
    this.selectedTab = 3;
  }

  revisorHandle(event,item): void {
    localStorage.setItem('crear_editar', '1,true')
    this._router.navigate([`/flujo-trabajos/vistos-buenos/`+item+'/editar']);
  }

  aprobadorHandle(event,item): void {
    localStorage.setItem('crear_editar', '2,true')
    this._router.navigate([`/flujo-trabajos/vistos-buenos/`+item+'/editar']);
  }

  autorizadorHandle(event,item): void {
    localStorage.setItem('crear_editar', '3,true')
    this._router.navigate([`/flujo-trabajos/vistos-buenos/`+item+'/editar']);
  }

  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }

}
