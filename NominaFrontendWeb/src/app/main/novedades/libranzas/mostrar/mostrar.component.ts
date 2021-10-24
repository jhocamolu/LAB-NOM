import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { MostrarService } from './mostrar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AprobarComponent } from '../aprobar/aprobar.component';
import { TerminarComponent } from '../terminar/aprobar.component';
import * as moment from 'moment';
import { estadoLibranzasAlcanos } from '@alcanos/constantes/estado-libranzas';


import { MatDialog } from '@angular/material/dialog';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { Router } from '@angular/router';


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
  tipoPeriodo: any;
  tipoPeriodoCount: number;
  subperiodos: any;
  embargoConceptoNomina: any;
  embargoConceptoNominaCount: number;
  subperiodosCount: number;
  el: any;
  arrayPermisos: any;
  estadoLibranzasAlcanosVar: any = estadoLibranzasAlcanos;
  periodoLiquidacion: boolean;

  constructor(
    private _permisos: PermisosrService,
    private _service: MostrarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _router: Router
  ) {
    moment.locale('es');

    this.element = this._service.item;
    this.arrayPermisos = this._permisos.permisosStorage('Libranzas_');

    this._service.getAusentismoPeriodoLiquidacion(this.element.id).then(resp => {
      this.periodoLiquidacion = false;
      const valor = resp.value;

      if (resp['@odata.count'] > 0) {
        valor.map(element => {
          if (element.nominaFuenteNovedad.moduloRegistroId == this.element.id) {
            this.periodoLiquidacion = true;
          }
        });
      }
    })


  }

  ngOnInit(): void {

    this._service.getShowTipoPeriodosId(this.element.id).then(resp => {
      this.tipoPeriodoCount = resp['@odata.count'];
      const array = [];
      const tipoPeriodo = [];
      resp.value.forEach(element => {
        array.push(element.subPeriodo);
        tipoPeriodo.push({
          id: element.subPeriodo.tipoPeriodo.id,
          nombre: element.subPeriodo.tipoPeriodo.nombre,
          pagoPorDefecto: element.subPeriodo.tipoPeriodo.pagoPorDefecto,
        });
      });

      this.subperiodosCount = array.length;
      this.subperiodos = array;
      this.tipoPeriodo = tipoPeriodo[0];
    });


  }


  snackSinPermiso(): void {
    this._alcanosSnackBar.snackbar({
      clase: 'informativo',
      mensaje: 'No autorizado: sin permisos para realizar esta acción.',
    });
  }


  anularHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._service._getLibranzas( this._service.id ).then( resp => {
          this.element = resp; 
        });
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
    });
  }

  terminarHandle(event, element): void {
    const dialogRef = this._matDialog.open(TerminarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._service._getLibranzas( this._service.id ).then( resp => {
          this.element = resp; 
        });
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
      }
    });
  }

}

