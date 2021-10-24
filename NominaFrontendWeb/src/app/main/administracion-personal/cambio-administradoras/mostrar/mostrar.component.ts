import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { MatDialog } from '@angular/material';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
  selector: 'cambio-administradora-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {


  // Permisos
  arrayPermisos: any;
  arrayPermisoCambios: any; 

  item: any;
  selectedTab = 0;




  constructor(
    private _service: MostrarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisoCambios = this._permisos.permisosStorage('ContratoAdministradorasCambios_');
  //  console.log( JSON.parse(localStorage.getItem('Permisos')).filter(x => x.includes('ContratoAdministradorasCambios_')));
    this.arrayPermisos = this._permisos.permisosStorage('ContratoAdministradoras_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      });

  }

}
