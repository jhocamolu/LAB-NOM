import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';

import { environmentAlcanos } from 'environments/environment.alcanos';
import { isArray } from 'util';
import { MostrarService } from './mostrar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AprobarComponent } from '../aprobar/aprobar.component';
import { AnularComponent } from '../anular/anular.component';
import { estadoAusentismosAlcanos } from '@alcanos/constantes/estado-ausentismos';
import * as moment from 'moment';


import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
registerLocaleData(localeCo, 'co');


@Component({
  selector: 'ausentismo-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  element: any;
  enviroments: string = environmentAlcanos.gestorArchivos;
  prorroga: string;
  arrayPermisos: any;
  estadoAusentismos = estadoAusentismosAlcanos;
  periodoLiquidacion: any; 

  
  constructor(
    private _permisos: PermisosrService,
    private _service: MostrarService,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
    this.element = this._service.item; 
    this.enviroments = environmentAlcanos.gestorArchivos;
    this.arrayPermisos = this._permisos.permisosStorage('AusentismoFuncionarios_');
    moment.locale('es');
    this.element.horaInicio = (this.element.horaInicio) ? moment(`2000-01-01 ${this.element.horaInicio}`).format('LT') : null;
    this.element.horaFin = (this.element.horaFin) ? moment(`2000-01-01 ${this.element.horaFin}`).format('LT') : null;

    this._service.getAusentismoPeriodoLiquidacion(this.element.id).then(resp => {
      this.periodoLiquidacion = false; 
      const valor = resp.value; 
      
      if(resp['@odata.count'] > 0){
        valor.map(element => {
          if( element.nominaFuenteNovedad.moduloRegistroId == this.element.id ){
            this.periodoLiquidacion = true; 
          }
        });
      }
    });

    if (this.element.ausentismoDe != null && isArray(this.element.ausentismoDe)) {
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
    }
  }


  descargarHandle(event, item): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${item.adjunto}`, '_blank');
  }


  ngOnInit(): void { }

  
  snackSinPermiso(): void {
    this._alcanosSnackBar.snackbar({
      clase: 'informativo',
      mensaje: 'No autorizado: sin permisos para realizar esta acción.',
    });
  }

  aprobarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._service._getAusentismoFuncionario(this._service.id).then(resp => {
          this.element = resp; 
        });
      }
    });
  }

  anularHandle(event, element): void {
    const dialogRef = this._matDialog.open(AnularComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._service._getAusentismoFuncionario(this._service.id).then(resp => {
          this.element = resp; 
        });
      }
    });
  }

}

