import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { MostrarService } from './mostrar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { MatSnackBar, Sort, MatSort, MatPaginator, MatTabChangeEvent } from '@angular/material';
import { merge, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { map } from 'rxjs/operators';
import { environmentAlcanos } from 'environments/environment.alcanos';
import { MostrarOtrosiComponent } from '../mostrar-otrosi/mostrar-otrosi.component';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { CancelarComponent } from '../cancelar/cancelar.component';
import { estadoContratoAlcanos } from '@alcanos/constantes/contratos';
import { registerLocaleData } from '@angular/common';
import localeCo from '@angular/common/locales/es-CO';
import * as moment from 'moment';
import { FinalizarComponent } from '../finalizar/finalizar.component';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';
registerLocaleData(localeCo, 'co');

@Component({
  selector: 'contratos-mostrar',
  templateUrl: './mostrar.component.html',
  styleUrls: ['./mostrar.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MostrarComponent implements OnInit {

  displayedColumnsOtrosi: string[] = ['numero', 'fechaAplicacion', 'tipoContrato', 'fechaFinalizacion', 'cargo', 'acciones'];
  otrosiDataSource: OtrosiDataSource | null;

  environments: any;

  item: any;

  indexTab: number;

  estadoContrato = estadoContratoAlcanos;
  otrosiDataRequest: boolean;
  pdf: any;
  arrayPermisos: any;
  arrayPermisosOtroSi: any;
  contratoCentroTrabajo: any; 

  constructor(
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _permisos: PermisosrService
  ) {
    this.arrayPermisos = this._permisos.permisosStorage('Contratos_', null, null, 'Contratos_Finalizar', null, null, 'FuncionarioCentroCostos_CrearManual')
    this.arrayPermisosOtroSi = this._permisos.permisosStorage('ContratoOtroSis_')
    this.environments = environmentAlcanos;
    this.otrosiDataRequest = true;
    this.indexTab = this._service.tab;

  }

  ngOnInit(): void {
    this._service.onItemChanged.subscribe(
      (resp) => {
        this.item = resp;
      }
    );
    this._service.onCentroTrabajoChanged.subscribe(resp => {
      resp.forEach(element => {
        this.contratoCentroTrabajo = element.centroTrabajo.nombre; 
      });
    });

    this._service.otrosiDataRequest.subscribe(resp => { this.otrosiDataRequest = resp });
    this.otrosiDataSource = new OtrosiDataSource(this._service);
  }

  urlDocument(d: number): void {
    this._service.getFile(this.item.funcionarioId).subscribe(data => {
      let blob = new Blob([data], { type: 'application/pdf' });
      let url = window.URL.createObjectURL(blob);
      this.pdf = url
      let link = document.createElement('a');
      link.href = url;
      const actual = moment().toDate();
      link.download = 'CONTRATO' + this.item.id + '_' + actual.getFullYear() + (actual.getMonth() + 1) + actual.getDate();
      link.click();
    }, error => {
      this._matSnackBar.open('El tipo de contrato no tiene una plantilla asignada.', 'Aceptar', {
        verticalPosition: 'top',
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    })
  }


  get hasOtrosiDataSource(): boolean {
    return this._service.onOtrosiChanged.value != null && this._service.onOtrosiChanged.value.length > 0;
  }

  onTabChangedHandle(event: MatTabChangeEvent): void {
    this.indexTab = event.index;
  }

  registrarOtrosi(event): void {
    if (this.item.estadoContrato != 'SinIniciar') {
      this._router.navigate([`/administracion-personal/contratos/${this.item.funcionarioId}/crear-otrosi`]);
    } else {
      this._matSnackBar.open('No se puede crear un otrosí ya que el contrato se encuentra en estado "Sin iniciar".', 'Aceptar', {
        verticalPosition: 'top',
        duration: 6000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  cancelarContratoHandle(event): void {
    const dialogRef = this._matDialog.open(CancelarComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: { id: this._service.id },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getContratos();
      }
    });
  }

  finalizarContratoHandle(event): void {
    const dialogRef = this._matDialog.open(FinalizarComponent, {
      panelClass: 'modal-dialog',
      disableClose: true,
      data: { id: this._service.id },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service._getContratos();
      }
    });
  }


  mostrarOtrosiHandle(event, elment): void {
    const dialogRef = this._matDialog.open(MostrarOtrosiComponent, {
      panelClass: 'mostrar-dialog',
      disableClose: false,
      data: elment
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  eliminarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarHandle(element.id).then(() => {
          this._matSnackBar.open('¡Perfecto! la operación se ha realizado exitosamente.', 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['exito-snackbar'],
          });

          this._service.refreshOtrosi();
        }, error => {
          this._matSnackBar.open(error.error.message, 'Aceptar', {
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['advertencia-snackbar'],
          });
        });
      }
    });
  }



}

export class OtrosiDataSource extends DataSource<any>{

  constructor(
    private _service: MostrarService,
  ) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this._service.onOtrosiChanged,

    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          const data = this._service.onOtrosiChanged.value.slice();
          return data;
        }
        ));
  }

  /**
   * Disconnect
   */
  disconnect(): void {
  }

}
