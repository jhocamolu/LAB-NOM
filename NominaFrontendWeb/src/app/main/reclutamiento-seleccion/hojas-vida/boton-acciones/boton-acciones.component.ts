import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'funcionarios-boton-acciones',
  templateUrl: './boton-acciones.component.html',
  styleUrls: ['./boton-acciones.component.scss']
})
export class BotonAccionesComponent implements OnInit {


  @Input('funcionario') item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
