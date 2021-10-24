import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, Input, Optional } from '@angular/core';
import { DiaMostrarService } from './dia-mostrar.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { DiaEditarComponent } from '../dia-editar/dia-editar.component';
import { DiaComponent } from '../dia/dia.component';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { PermisosrService } from '@alcanos/services/permisos/permisos.service';

@Component({
  selector: 'jornada-laboral-dias-mostrar',
  templateUrl: './dia-mostrar.component.html',
  styleUrls: ['./dia-mostrar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiaMostrarComponent implements OnInit {

  // Permisos
  arrayPermisosDias: any;

  diaLista: any[] = [];

  // tslint:disable-next-line: no-input-rename
  @Input('jornada-laboral-id') id: any;

  // tslint:disable-next-line: no-input-rename
  @Input('mostrar-acciones') mostrarAcciones: boolean = true;

  @Input('mostrar-empty') mostrarEmpty: boolean = true;

  dataRequest: boolean;


  selectedTab: number;

  tablaDia: DiaMostrarComponent;

  constructor(
    private _service: DiaMostrarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
    private _matDialog: MatDialog,
    private _permisos: PermisosrService,
  ) {
    this.arrayPermisosDias = this._permisos.permisosStorage('JornadaLaboralDias_');
    this.dataRequest = true;
  }

  ngOnInit(): void {
    this._service.init(this.id);
    this._service.dataRequest.subscribe(value => {this.dataRequest = value;});

    this._service.onItemsChange.subscribe((values: any[]) => {      
      this.diaLista = [];
      values.forEach((element) => {
        let jornada: any = {};
        jornada = {
          id: element.id,
          dia: element.dia,
          jornadaLaboralId: element.jornadaLaboralId,
          horaFinDescanso: (element.horaFinDescanso) ? moment(`2000-01-01 ${element.horaFinDescanso}`).format('LT') : null,
          horaFinJornada: (element.horaFinJornada) ? moment(`2000-01-01 ${element.horaFinJornada}`).format('LT') : null,
          horaInicioDescanso: (element.horaInicioDescanso) ? moment(`2000-01-01 ${element.horaInicioDescanso}`).format('LT') : null,
          horaInicioJornada: (element.horaInicioJornada) ? moment(`2000-01-01 ${element.horaInicioJornada}`).format('LT') : null,
        };
        this.diaLista.push(jornada);
      });


    });
  }

  tabChangeHandle(event): void {
    this.selectedTab = event.index;
  }
  public primero(): void {
    this.selectedTab = 0;
  }

  public segundo(): void {
    this.selectedTab = 1;
  }


  eliminarHandle(event, id): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: `¿Estás seguro de eliminar este registro de forma permanente?`,
        clase: 'error',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this._service.eliminarHandle(id).then(() => {
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
          this._service.refreshJornadas();
        });
      }
    });
  }

  // se comunica con el componente Dia
  editarDiaHandle(event, element): void {
    const dialogRef = this._matDialog.open(DiaEditarComponent, {
      panelClass: 'modal-dialog450',
      data: element,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined' && result != null) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._service.refreshJornadas();
      }
    });
  }

  refresh(): void {
    this._service.refreshJornadas();
  }

  // se comunica con el componente Dia
  diaHandle(event): void {
    const dialogRef = this._matDialog.open(DiaComponent, {
      panelClass: 'modal-dialog450',
      data: {
        id: this._service.id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      
      if ( result === true) {
        this._alcanosSnackBar.snackbar({ clase: 'exito' });
        this._service.refreshJornadas();
      }
     
    });
  }




}
