import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { isArray } from 'util';
import { ListarService } from '../listar/listar.service';

@Component({
  selector: 'ausentismo-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent {

  enviroments: string = environmentAlcanos.gestorArchivos;
  prorroga: string;

  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _service: ListarService
  ) {

    moment.locale('es');
    this.element.horaInicio = (this.element.horaInicio) ? moment(`2000-01-01 ${this.element.horaInicio}`).format('LT') : null;
    this.element.horaFin = (this.element.horaFin) ? moment(`2000-01-01 ${this.element.horaFin}`).format('LT') : null;

    /*if (this.element.ausentismoDe != null && isArray(this.element.ausentismoDe)) {
      this.element.ausentismoDe.forEach(value => {
        this._service.getProrroga(value.id).then(
          resp => {
            if (resp != null && resp.prorroga != null && resp.prorroga.diagnosticoCie != null) {
              const codigo = resp.prorroga.diagnosticoCie.codigo;
              this.prorroga = `${codigo}(${moment(resp.prorroga.fechaInicio).format('MMM DD, Y')} - ${moment(resp.prorroga.fechaFin).format('MMM DD, Y')})`;
            }

          }
        );
      });
    }*/
  }


  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjunto}`, '_blank');
  }

}
