import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MostrarService } from '../mostrar/mostrar.service';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { fuseAnimations } from '@fuse/animations';
import { estadoContratoAlcanos } from '@alcanos/constantes/contratos';

@Component({
  selector: 'contrato-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  estadoContrato = estadoContratoAlcanos;

  enviroments: string = environmentAlcanos.gestorArchivos;

  cargoDependencia: any[];
  @Input('contratos') item: any;

  constructor(
    private _service: MostrarService,
  ) { }

  ngOnInit(): void { }

}
