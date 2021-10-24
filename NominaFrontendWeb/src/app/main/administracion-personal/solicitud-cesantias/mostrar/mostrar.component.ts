import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { isArray } from 'util';
import { ListarService } from '../listar/listar.service';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { MostrarService } from './mostrar.service';
import { AprobarComponent } from '../aprobar/aprobar.component';
registerLocaleData(localeCo, 'co');


@Component({
  selector: 'solicitud-cesantias-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent {
  element:any ;
  enviroments: string = environmentAlcanos.gestorArchivos;

  constructor(
    private _service: MostrarService,
    private _matDialog: MatDialog
  ) {
    this.element = this._service.onItemChanged.value
  }

  aprobarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getSolicitudCesantias(this.element.id).then(data=>{
          this.element = data
        })
      }
    });
  }

  descargarHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.soporte}`, '_blank');
  }

}
