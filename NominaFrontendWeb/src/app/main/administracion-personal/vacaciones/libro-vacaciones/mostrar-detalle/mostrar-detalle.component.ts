import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MostrarLibroService } from '../mostrar-libro/mostrar-libro.service';
import { MostrarDetalleService } from './mostrar-detalle.service';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'vacaciones-mostrar-detalle',
  templateUrl: './mostrar-detalle.component.html',
  styleUrls: ['./mostrar-detalle.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarDetalleComponent implements OnInit {

  item: any;
  interrupcionesCount: number;
  interrupciones: any;
  datosNuevos: any = []; 
  espera: boolean = true;
  contador: any; 
  
  constructor(
    public dialogRef: MatDialogRef<MostrarDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    public _service: MostrarLibroService,
    public _service2: MostrarDetalleService,
  ) { }

  ngOnInit(): void {
    
    this._service.getSolicitudVacaciones(this.element.id).then(resp => {
      resp.value.forEach(element => {
        this.datosNuevos.push(element);
      });
      this.contador = resp['@odata.count'];
      this.espera = false; 
    });

    this._service.getInterrupciones(this.element.id).then(resp => {
      this.interrupcionesCount = resp['@odata.count'];
    });
  }

}
