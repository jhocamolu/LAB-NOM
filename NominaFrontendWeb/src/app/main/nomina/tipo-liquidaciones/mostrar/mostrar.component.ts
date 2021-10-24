import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';

import { ListarEditarComponent } from '../listar-editar/listar-editar.component';
import { EstadosComponent } from '../estados/estados.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { FormularioParametroComponent } from '../parametros-formulario/formulario.component';
import { ParametroComponent } from '../parametros/parametro.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'liquidaciones-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  // Permisos
  arrayPermisos: any;
  arrayPermisosConceptos: any;
  arrayPermisosEstados: any;

  item: any;
  selectedTab = 0;

  @ViewChild(ListarEditarComponent, { static: false })
  listarEditar: ListarEditarComponent;


  @ViewChild(EstadosComponent, { static: false })
  Estados: EstadosComponent;

  @ViewChild(ParametroComponent, { static: false })
  Parametros: ParametroComponent;

  
  modulos: any;
  

  constructor(
    private _service: MostrarService,
    private _permisos: PermisosrService,
    private _matDialog: MatDialog,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('TipoLiquidaciones_');
    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoLiquidacionConceptos_');
    this.arrayPermisosEstados = this._permisos.permisosStorage('TipoLiquidacionEstados_');

  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;

        const modulo = [];
        this._service.getTipoliquidacionModulos(resp.id).then(data => {
          if (data['@odata.count'] !== 0) {
            data.value.map(element => {
              if (element.modulo == 'HorasExtra') {
                modulo.push('Horas extra');
              } else if (element.modulo == 'GastosViaje') {
                modulo.push('Gastos de viaje');
              } else if (element.modulo == 'OtrasNovedades') {
                modulo.push('Otras novedades');
              } else if (element.modulo == 'AnticipoCesantias') {
                modulo.push('Anticipo de cesantías');
              } else {
                modulo.push(element.modulo);
              }
            });
            this.modulos = modulo.join(', ');
          } else {
            this.modulos = 'N/A';
          }

        });


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

  conceptoHandle(event): void {
    this.segundo();
    this.listarEditar.conceptoHandle(event);
  }

  estadoHandle(event): void {
    this.tercero();
    this.Estados.estadoHandle(event);
  }

  crearParametroHandle(event): void {
    this.cuarto();
    this.Parametros.crearParametroHandle(event);
  }

  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }
}


