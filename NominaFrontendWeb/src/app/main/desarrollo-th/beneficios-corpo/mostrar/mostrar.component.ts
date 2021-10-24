import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AlcanosValidators } from '@alcanos/utils';
import { HttpErrorResponse } from '@angular/common/http';
import { MostrarService } from './mostrar.service';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { estadoBeneficiosAlcanos } from '@alcanos/constantes/estado-beneficios';

import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { NotaComponent } from '../nota/nota.component';
import { AprobarComponent } from '../aprobar/aprobar.component';
import { AutorizarComponent } from '../autorizar/autorizar.component';

import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

registerLocaleData(localeCo, 'co');

@Component({
  selector: 'beneficios-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  item: any;
  superiodos: any[] = [];
  adjuntos: any[] = [];
  environments: any;
  tipo: any;

  form: FormGroup;
  enviroments: string;
  tipoBeneficios: any[];
  estadosBeneficios: any;
  estadoSolicitud = estadoBeneficiosAlcanos;

  // Activaciones
  permiteAuxilioEducativo: boolean;
  permitePeriodoPago: boolean;
  permiteValorSolicitado: boolean;
  permitePlazoMes: boolean;
  requiereAprobacionJefe: boolean;
  permiteEstudio: boolean;
  permiteEstudioAuxilioEducativo: boolean;
  permiteSoloAuxilioEducativo: boolean;
  permiteValorAutorizado: boolean;
  arrayPermisos: any;
  arrayPermisosAdjunto: any;

  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _service: MostrarService,
    private _permisos: PermisosrService
  ) {

    this.enviroments = environmentAlcanos.gestorArchivos;
    this._service.onItemChanged.subscribe(respuesta => {
      this.item = respuesta;
      this.item = this.item === null ? {} : this.item;
      this.superiodos = [];
      // subperiodos

      this._service.getBeneficioSubperiodos(this.item.id).then(resp => {
        resp.map(data => {
          this.superiodos.push(data.subPeriodo);
        });
      });

      this._service.getBeneficioAdjuntos(this.item.id).then(resp => {
        this.adjuntos = resp;
      });

      this.estadosBeneficios = estadoBeneficiosAlcanos;
      this.tipo = this.item.tipo;
      this.environments = environmentAlcanos.gestorArchivos;


      this._service.getTipoBeneficios(this.item.tipoBeneficioId).then(resp => {
        this.tipoBeneficios = resp;

        this.permiteAuxilioEducativo = resp.permiteAuxilioEducativo;
        this.permiteEstudio = resp.permisoEstudio;
        this.permiteEstudioAuxilioEducativo = resp.permisoEstudio || resp.permiteAuxilioEducativo;
        this.permiteSoloAuxilioEducativo = resp.permiteAuxilioEducativo;
        this.permiteValorAutorizado = resp.valorAutorizado;

        this.permitePeriodoPago = resp.periodoPago;
        this.permiteValorSolicitado = resp.valorSolicitado;
        this.permitePlazoMes = resp.plazoMes;
        this.requiereAprobacionJefe = resp.requiereAprobacionJefe;

      });
  
      this.arrayPermisos = this._permisos.permisosStorage('Beneficios_');
      this.arrayPermisosAdjunto = this._permisos.permisosStorage('BeneficioAdjuntos_');
    });

  }

  ngOnInit(): void { }

  aprobarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AprobarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getBeneficios();
      }
    });
  }


  autorizarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AutorizarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getBeneficios();
      }
    });
  }


  registrarNotaHandle(event, element): void {
    const dialogRef = this._matDialog.open(NotaComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getBeneficios();
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
        const dato = this.estadoSolicitud.tramite;
        this._service.estado(element.id, dato).then(result => {
          this._service.getBeneficios();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
      }
    });
  }

}

