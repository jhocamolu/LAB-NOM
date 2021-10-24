import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MostrarService } from './mostrar.service';
import { EmbargarCrearComponent } from '../embargar-crear/embargar-crear.component';
import { MatDialog } from '@angular/material/dialog';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'tipo-ausentismos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {
  // Permisos
  arrayPermisos: any;
  arrayPermisosConceptos: any;

  item: any;
  selectedTab = 0;
  conceptoCount: number;
  conceptoAEmbargar: any;

  constructor(
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('TipoEmbargos_');
    this.arrayPermisosConceptos = this._permisos.permisosStorage('TipoEmbargoConceptoNominas_');
  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );

    this._service._getTipoEmbargoConceptoNominas(this.item.tipoEmbargoId).then(resp => {
      this.conceptoCount = resp['@odata.count'];
      this.conceptoAEmbargar = resp.value;
    });
  }


  crearHandle(event, dato): void {
    const dialogRef = this._matDialog.open(EmbargarCrearComponent, {
      panelClass: 'modal-dialog',
      disableClose: true,
      data: dato
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getTipoEmbargoConceptoNominas(this.item.tipoEmbargoId).then(resp => {
          this.conceptoCount = resp['@odata.count'];
          this.conceptoAEmbargar = resp.value;
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        });
      }
    });
  }

  selectedTabChangeHandle(event): void {
    this.selectedTab = event.index;
  }

}
