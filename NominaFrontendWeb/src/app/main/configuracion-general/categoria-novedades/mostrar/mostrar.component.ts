import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { isArray } from 'util';
import { ListarService } from '../listar/listar.service';
import { modulosCategoriaNovedades, modulosMCategoriaNovedades, ubicacionTerceroCategoriaNovedades, ubicacionTerceroM } from '@alcanos/constantes/categoria-novedades';

@Component({
  selector: 'categoria-novedades-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent {
  // modulos
  modulos = modulosCategoriaNovedades;
  moduloMostrar = modulosMCategoriaNovedades;

  // ubicacion terceros
  ubicacionTercero = ubicacionTerceroCategoriaNovedades;
  UbiTerceroM = ubicacionTerceroM;



  constructor(
    public dialogRef: MatDialogRef<MostrarComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _service: ListarService
  ) {
  }

}
