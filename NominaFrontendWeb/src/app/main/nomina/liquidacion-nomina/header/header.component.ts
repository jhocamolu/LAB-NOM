import { Component, OnInit, Input, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { estadoNominaAlcanos } from '@alcanos/constantes/estado-nomina';

@Component({
  selector: 'liquidacion-nomina-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent{

  @Input()
  item: any;
  @Input()
  nuevoEstado: any;

  estadoLiquidacion = estadoNominaAlcanos;

  constructor() {}

}