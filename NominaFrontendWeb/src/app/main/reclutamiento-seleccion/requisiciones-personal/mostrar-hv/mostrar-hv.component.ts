import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { CandidatosListarService } from '../candidatos/listar/listar.service';

@Component({
  selector: 'requisiciones-mostrar-hv',
  templateUrl: './mostrar-hv.component.html',
  styleUrls: ['./mostrar-hv.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarHvComponent {

  enviroments: string = environmentAlcanos.gestorArchivos;

  constructor(
    public dialogRef: MatDialogRef<MostrarHvComponent>,
    @Inject(MAT_DIALOG_DATA) public element: any,
    private _service: CandidatosListarService
  ) {
  }

  descargarPruebaHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjuntoPruebas}`, '_blank');
  }

  descargarExamenHandle(event, element): void {
    window.open(`${this.enviroments}/bucket/download?document_id=${element.adjuntoExamen}`, '_blank');
  }

  hojaVidaHandle(event, element): void {
    window.open(`/reclutamiento-seleccion/hojas-vida/${element.hojaDeVidaId}/mostrar`, '_blank');
  }

}
