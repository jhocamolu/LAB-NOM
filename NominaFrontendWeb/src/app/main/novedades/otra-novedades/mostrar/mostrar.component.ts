import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
import { ListarService } from '../listar/listar.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { MostrarService } from './mostrar.service';
import { estadoNovedades } from '@alcanos/constantes/clase-novedades';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'otra-novedades-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  id: any;
  item: any;
  element: any;
  tipoPeriodo: any;
  tipoPeriodoCount: number;
  subperiodos: any;
  subperiodosCount: number;


  nitTercero: any;
  nombreTercero: any;

  estadoNovedad = estadoNovedades;
  arrayPermisos:any;
  constructor(
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: MostrarService,
    private _service2: ListarService,
    private _permisos : PermisosrService
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Novedades_')
    this._service.onItemsChanged.subscribe((resp) => {
      this.element = resp;
      this.id = resp.id;
    });
  }

  ngOnInit(): void {
    this._service2.getShowTipoPeriodosId(this.element.id).then(resp => {
      this.tipoPeriodoCount = resp['@odata.count'];

      const array = [];
      const tipoPeriodo = [];
      resp.value.forEach(elemento => {
        array.push(elemento.subperiodo);
        tipoPeriodo.push({
          id: elemento.subperiodo.tipoPeriodo.id,
          nombre: elemento.subperiodo.tipoPeriodo.nombre,
          pagoPorDefecto: elemento.subperiodo.tipoPeriodo.pagoPorDefecto,
        });
      });

      this.subperiodosCount = array.length;
      this.subperiodos = array;
      this.tipoPeriodo = tipoPeriodo[0];

    });

    // llamar al servicio donde se encuentra el tercero dependiedo de la ubicacion
    if (this.element.terceroId !== null && this.element.categoriaNovedad !== null && this.element.categoriaNovedad.ubicacionTercero === 'Administradora') {
      this._service.getTerceroAdministradorasSolo(this.element.terceroId)
        .then(resp => {
          this.nitTercero = resp.nit;
          this.nombreTercero = resp.nombre;
          // this.form.patchValue({
          //   tercero: resp
          // });
        });
    }

    if (this.element.terceroId !== null && this.element.categoriaNovedad !== null && this.element.categoriaNovedad.ubicacionTercero === 'EntidadFinanciera') {
      this._service.getTerceroEntidadFinancierasSolo(this.element.terceroId)
        .then(resp => {
          this.nitTercero = resp.nit;
          this.nombreTercero = resp.nombre;
          // this.form.patchValue({
          //   tercero: resp
          // });
        });
    }

    if (this.element.terceroId !== null && this.element.categoriaNovedad !== null && this.element.categoriaNovedad.ubicacionTercero === 'OtrosTerceros') {
      this._service.getTerceroOtroTerceroSolo(this.element.terceroId)
        .then(resp => {
          this.nitTercero = resp.nit;
          this.nombreTercero = resp.nombre;
          // this.form.patchValue({
          //   tercero: resp
          // });
        });
    }

  }

  anularHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro que deseas anular la solicitud?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const dato = this.estadoNovedad.anulada;
        this._service.estado(element.id, dato).then(result => {
          this._service.getNovedad();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
      }
    });
  }

  cancelarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro que deseas cancelar la solicitud?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const dato = this.estadoNovedad.cancelada;
        this._service.estado(element.id, dato).then(result => {
          this._service.getNovedad();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
      }
    });
  }

}
