import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { Router } from '@angular/router';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'parametros-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class MostrarComponent implements OnInit {

  categoria: any;
  items: any[];
  selects: any;
  anio: number;
  todoAnnio: any;
  // Permisos
  arrayPermisos: any;

  constructor(
    private _router: Router,
    private _service: MostrarService,
    private _permisos: PermisosrService
  ) {
    this.categoria = this._service.categoria;
    this.items = this._service.items;

    this.selects = {};
    this.todoAnnio = this._service.todoAnnios;
    this.arrayPermisos = this._permisos.permisosStorage('ParametroGenerales_');
  }

  ngOnInit(): void {
    if (this.items) {
      this.items.forEach(element => {
        if (element.tipo === 'Select') {
          this.selects[element.alias] = [];
          if (element.item) {
            this._service.getData(element.item)
              .then(resp => {
                this.selects[element.alias] = resp;
              });
          }
        }
      });
    }
  }

  valor(id: any, alias: any): string {
    let valor: any = '';
    this.selects[alias].forEach(element => {
      const values = Object.values(element);
      if (values[0] == id) {
        valor = values[1];
      }
    });
    return valor;
  }

  navigate(event, item): void {
    const toUrlEncoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    this._router.navigate([`/configuracion/parametros/${item}/editar`], {
      queryParams: {
        $anno: toUrlEncoded({ annoVigente: this._service.anio }),
      }
    });
  }

}
