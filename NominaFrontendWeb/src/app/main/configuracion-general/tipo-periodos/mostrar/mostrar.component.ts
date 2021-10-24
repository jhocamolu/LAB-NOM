import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { SubperiodoComponent } from '../subperiodos/subperiodos.component';
import { MostrarService } from './mostrar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-periodos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  // Permisos
  arrayPermisos: any;

  item: any;
  selectedTab = 0;

  @ViewChild(SubperiodoComponent, { static: false })
  subperiodo: SubperiodoComponent;


  constructor(
    private _service: MostrarService,
    private _permisos: PermisosrService,
  ) { 
    this.arrayPermisos = this._permisos.permisosStorage('TipoPeriodos_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );
  }

  subperiodoHandle(event): void {
    this.segundo();
    this.subperiodo.subperiodoHandle(event);
  }

  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }

  selectedTabChangeHandle(event) {
    this.selectedTab = event.index;
  }
}
