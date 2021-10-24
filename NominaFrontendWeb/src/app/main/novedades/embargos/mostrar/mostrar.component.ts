import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder } from '@angular/forms';
import { MostrarService } from '../mostrar/mostrar.service';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
import { AnularComponent } from '../anular/anular.component';
import { TerminarComponent } from '../terminado/terminado.component';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'embargos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
}) 
export class MostrarComponent implements OnInit{

  embargo: any;
  concepto: any;
  arrayPermisos: any;
  periodoLiquidacion: boolean;
  constructor(
    private _service: MostrarService,
    private _permisos: PermisosrService,
    private _matDialog: MatDialog,
    private _router: Router
  ) { 
    this.arrayPermisos = this._permisos.permisosStorage('Embargos_');
    this.embargo = this._service.onItemChanged.value
    this.concepto = this._service.onConceptoChanged.value.value
    this._service.getEmbargoPeriodoLiquidacion(this.embargo.id).then(resp => {
      this.periodoLiquidacion = false; 
      const valor = resp.value; 
      
      if(resp['@odata.count'] > 0){
        valor.map(element => {
          if( element.nominaFuenteNovedad.moduloRegistroId == this.embargo.id ){
            this.periodoLiquidacion = true; 
          }
        });
      }
    });
}

ngOnInit(): void{    
  }

  terminarHandle(event, element): void {
    const dialogRef = this._matDialog.open(TerminarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: element
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getEmbargos(this.embargo.id).then(data=>{
          this.embargo = data
        })
        // this._router.navigate(['/novedades/embargos/'])
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
      if (result === true) {
        this._service._getEmbargos(this.embargo.id).then(data=>{
          this.embargo = data
        })
        // this._router.navigate(['/novedades/embargos/'])
      }
    });
  }

}
