import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { fuseAnimations } from '@fuse/animations';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'funcionarios-cards-listar',
  templateUrl: './cards-listar.component.html',
  styleUrls: ['./cards-listar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CardsListarComponent implements OnInit {

  enviroments: string = environmentAlcanos.gestorArchivos;
  datosActuales: any;

  colors: string[] = [
    '#B72974',
    '#FFA124',
    '#066F77',
    '#6232CC',
    '#004693',
    '#EE564C',
    '#602411',
    '#EF6100',
    '#FF7D43',
    '#8822A0',
    '#3DBDD3',
    '#CE7459',
    '#9B193E',
    '#3FD195',
    '#FF7D7D',
    '#9ABF00',
  ];

  @Input('funcionario') item: any;
  @Input('colorsInput') i: any;
  arrayPermisos:any;

  constructor(
    private _permisos : PermisosrService
    ) {
        this.arrayPermisos = this._permisos.permisosStorage('Funcionarios_')}

  ngOnInit(): void {}

  color(i: number): string {
    return this.colors[i % this.colors.length];
  }

}
