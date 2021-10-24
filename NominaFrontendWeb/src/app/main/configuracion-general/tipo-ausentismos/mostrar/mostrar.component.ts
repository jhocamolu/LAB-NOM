import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ConceptoComponent } from '../concepto/concepto.component';
import { MostrarService } from './mostrar.service';
import { CrearConceptoComponent } from '../crear-concepto/crear-concepto.component';
import { MatDialog } from '@angular/material';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';


@Component({
  selector: 'tipo-ausentismos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {


  // Permisos
  arrayPermisos: any;
  arrayPermisosConceptos: any;

  item: any;
  selectedTab = 0;

  @ViewChild(ConceptoComponent, { static: false })
  concepto: ConceptoComponent;
  //
  // conceptos: any;
  // conceptosCount: any;


  constructor(
    private _service: MostrarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('TipoAusentismos_');
    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoAusentismoConceptoNominas_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      });

    // this._service.onConceptosChanged.subscribe((resp) => {
    //   this.conceptosCount = resp['@odata.count'] === 0 ? true : false;
    //   this.conceptos = resp.value;
    // });

  }


  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }


  conceptoHandle(event): void {
    this.segundo();
    this.concepto.conceptoHandle(event);
  }

  // tslint:disable-next-line: typedef
  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }


}
