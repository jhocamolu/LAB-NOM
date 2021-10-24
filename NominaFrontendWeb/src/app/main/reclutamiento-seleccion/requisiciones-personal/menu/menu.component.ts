import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { estadoRequisicionPersonalAlcanos } from '@alcanos/constantes/estado-requisicion-personal';
import { MatDialog } from '@angular/material';
import { EstadoComponent } from '../estado/estado.component';
import { MostrarService } from '../mostrar/mostrar.service';
import { AlcanosConfirmDialogComponent } from '@alcanos/components/confirm-dialog/confirm-dialog.component';
import { EstadoService } from '../estado/estado.service';
import { AlcanosSnackBarService } from '@alcanos/services/snackbar/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'requisiciones-personal-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  id: number;
  estadoRequisicion = estadoRequisicionPersonalAlcanos;

  @Input('item') item: any;
  @Input('cuenta') count: any;

  @Input('permiso') permisos: any;


  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _service: MostrarService,
    private _alcanosSnackBar: AlcanosSnackBarService,
  ) {
  }

  ngOnInit(): void { }

  estadoHandle(event, type): void {
    const dialogRef = this._matDialog.open(EstadoComponent, {
      panelClass: 'modal-dialog',
      disableClose: false,
      data: { id: this._service.id, type: type },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this._service.getRequisicionPersonales();
      }
    });
  }

  cerrarHandle(event, element): void {
    const dialogRef = this._matDialog.open(AlcanosConfirmDialogComponent, {
      disableClose: false,
      data: {
        mensaje: ` ¿Esta requisición se encuentra abierta. ¿Estás seguro de cerrarla?`,
        clase: 'exito',
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const dato = this.estadoRequisicion.cubierta;
        this._service.estado(element.id, dato).then(result => {
          this._service.getRequisicionPersonales();
          this._alcanosSnackBar.snackbar({ clase: 'exito' });
        }).catch((resp: HttpErrorResponse) => {
          let error = resp.error;
          if (typeof resp.error === 'string') {
            error = JSON.parse(resp.error);
          } else {
            error = resp.error;
          }
          if (resp.status === 400 && 'errors' in error) {
            if ('snackError' in error.errors) {
              const errors = {};
              error.errors.snackError.forEach(element => {
                this._alcanosSnackBar.snackbar({
                  clase: 'error',
                  mensaje: element,
                  time: 8000
                });
              });
            }
          }
        });
      }
    });
  }

}
