import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { MatSort, MatPaginator, PageEvent } from '@angular/material';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'contratos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  bases: any[] = [];

  item: any;
  selectedTab = 0;
  arrayPermisos: any;
  tipoAdministradora: any;
  tipoAdministradoraCount: number; 
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;


  constructor(
    private _service: MostrarService,
    private _permisos: PermisosrService
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('ConceptoNominas_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
        this._service.getTipoAdministradorasSolo(resp.id).then(respuesta => {
          this.tipoAdministradoraCount = respuesta['@odata.count']; 
          this.tipoAdministradora = respuesta.value;
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


  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }



}

